import { Injectable } from '@angular/core';
import {
  ChildProfile,
  ParentAccount,
  Session,
  Student,
  WeakSpot,
  DrillType,
  DRILL_LABELS,
  buildInitialProgress,
  getSubLevel,
  getNextSubLevel,
  isSectionComplete,
  SUB_LEVELS,
} from './models';

const DB_NAME = 'MathDrillDB';
const DB_VERSION = 2;

@Injectable({ providedIn: 'root' })
export class DbService {
  private db: IDBDatabase | null = null;

  // ── Open DB ────────────────────────────────────────────────────────────────
  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('accounts')) {
          db.createObjectStore('accounts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('children')) {
          db.createObjectStore('children', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const store = db.createObjectStore('sessions', { keyPath: 'id' });
          store.createIndex('childId', 'childId', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }
      };

      req.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // ── Generic helpers ────────────────────────────────────────────────────────
  private async get<T>(store: string, key: string): Promise<T | undefined> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => reject(req.error);
    });
  }

  private async put(store: string, value: any): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).put(value);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private async getAll<T>(store: string): Promise<T[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  private async getAllByIndex<T>(store: string, index: string, value: string): Promise<T[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const idx = tx.objectStore(store).index(index);
      const req = idx.getAll(value);
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  private async deleteRecord(store: string, key: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteSessionsForChild(childId: string): Promise<void> {
    const sessions = await this.getSessionsForChild(childId);
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      for (const s of sessions) {
        store.delete(s.id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ── SHA-256 helper ─────────────────────────────────────────────────────────
  async hashPin(pin: string): Promise<string> {
    const buf = new TextEncoder().encode(pin);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async verifyPin(pin: string, hash: string): Promise<boolean> {
    return (await this.hashPin(pin)) === hash;
  }

  // ── UUID ───────────────────────────────────────────────────────────────────
  private uuid(): string {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // ══ PARENT ACCOUNT ════════════════════════════════════════════════════════

  async getParent(): Promise<ParentAccount | undefined> {
    return this.get<ParentAccount>('accounts', 'parent');
  }

  async createParent(pin: string): Promise<ParentAccount> {
    const pinHash = await this.hashPin(pin);
    const account: ParentAccount = {
      id: 'parent',
      pinHash,
      childIds: [],
      createdAt: Date.now(),
    };
    await this.put('accounts', account);
    return account;
  }

  async updateParent(patch: Partial<ParentAccount>): Promise<void> {
    const existing = await this.getParent();
    if (!existing) return;
    await this.put('accounts', { ...existing, ...patch });
  }

  // ══ CHILDREN ══════════════════════════════════════════════════════════════

  async getChild(id: string): Promise<ChildProfile | undefined> {
    return this.get<ChildProfile>('children', id);
  }

  async getAllChildren(): Promise<ChildProfile[]> {
    const parent = await this.getParent();
    if (!parent) return [];
    const all = await this.getAll<ChildProfile>('children');
    // Return in order of childIds
    return parent.childIds
      .map((id) => all.find((c) => c.id === id))
      .filter((c): c is ChildProfile => !!c);
  }

  async createChild(name: string, avatar: string): Promise<ChildProfile> {
    const id: string = this.uuid();
    const child: ChildProfile = {
      id,
      name,
      avatar,
      createdAt: Date.now(),
      student: {
        name,
        dailyStreak: 0,
        lastSessionDate: null,
        totalSessions: 0,
        totalCorrect: 0,
        badges: [],
        subLevelProgress: buildInitialProgress(),
        currentSubLevelId: 'A1',
      },
      weakSpots: [],
    };
    await this.put('children', child);

    // Add to parent's childIds
    const parent = await this.getParent();
    if (parent) {
      parent.childIds.push(id);
      await this.put('accounts', parent);
    }
    return child;
  }

  async updateChild(id: string, patch: Partial<ChildProfile>): Promise<void> {
    const existing = await this.getChild(id);
    if (!existing) return;
    await this.put('children', { ...existing, ...patch });
  }

  async deleteChild(id: string): Promise<void> {
    await this.deleteRecord('children', id);
    // Remove from parent
    const parent = await this.getParent();
    if (parent) {
      parent.childIds = parent.childIds.filter((c) => c !== id);
      await this.put('accounts', parent);
    }
    // Remove sessions
    const sessions = await this.getSessionsForChild(id);
    for (const s of sessions) {
      await this.deleteRecord('sessions', s.id);
    }
  }

  // ══ SESSIONS ══════════════════════════════════════════════════════════════

  async getSessionsForChild(childId: string): Promise<(Session & { childId: string })[]> {
    return this.getAllByIndex('sessions', 'childId', childId);
  }

  async saveSession(childId: string, session: Session): Promise<ChildProfile | null> {
    // Save session with childId
    await this.put('sessions', { ...session, childId });

    // Update child's student record
    const child = await this.getChild(childId);
    if (!child) return null;

    const student = child.student;
    student.totalSessions++;
    student.totalCorrect += session.score;

    // Daily streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const last = student.lastSessionDate;
    if (last === today) {
      /* no change */
    } else if (last === yesterday) {
      student.dailyStreak++;
    } else {
      student.dailyStreak = 1;
    }
    student.lastSessionDate = today;

    // Sub-level progress
    const slId = session.subLevelId;
    const slDef = getSubLevel(slId);
    const prog = student.subLevelProgress[slId];

    if (prog && slDef) {
      prog.attempts++;
      prog.bestAccuracy = Math.max(prog.bestAccuracy, session.accuracy);
      prog.bestTimeSec = Math.min(prog.bestTimeSec, session.avgTimeSec);

      if (session.passed) {
        prog.consecutivePassCount++;
      } else {
        prog.consecutivePassCount = 0;
      }

      if (!prog.completed && prog.consecutivePassCount >= slDef.passStreakRequired) {
        prog.completed = true;

        student.badges.push({
          id: `complete_${slId}`,
          label: `${slId} Complete!`,
          icon: '⭐',
          earnedDate: today,
        });

        const next = getNextSubLevel(slId);
        if (next) {
          const nextProg = student.subLevelProgress[next.id];
          if (nextProg && !nextProg.unlocked) {
            nextProg.unlocked = true;
          }
          student.currentSubLevelId = next.id;
        }

        if (slDef && isSectionComplete(slDef.section, student.subLevelProgress)) {
          student.badges.push({
            id: `section_${slDef.section}`,
            label: `${slDef.section} Mastered! 🏆`,
            icon: '🏆',
            earnedDate: today,
          });
        }
      }
    }

    // Weak spots
    const allSessions = await this.getSessionsForChild(childId);
    child.weakSpots = this.computeWeakSpots(allSessions as any);
    child.student = student;

    await this.put('children', child);
    return child;
  }

  private computeWeakSpots(sessions: Session[]): any[] {
    const map = new Map<
      DrillType,
      { errors: number; totalTime: number; count: number; subLevelId: string }
    >();
    for (const session of sessions.slice(-20)) {
      for (const q of session.questions) {
        const entry = map.get(q.drillType) ?? {
          errors: 0,
          totalTime: 0,
          count: 0,
          subLevelId: q.subLevelId,
        };
        if (!q.correct) entry.errors++;
        entry.totalTime += q.timeSec;
        entry.count++;
        map.set(q.drillType, entry);
      }
    }
    return Array.from(map.entries())
      .map(([drillType, data]) => ({
        drillType,
        subLevelId: data.subLevelId,
        label: DRILL_LABELS[drillType],
        errorCount: data.errors,
        avgTimeSec: parseFloat((data.totalTime / data.count).toFixed(1)),
      }))
      .filter((w) => w.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 5);
  }

  // ══ EXPORT ════════════════════════════════════════════════════════════════

  exportCSV(sessions: Session[], childName: string): void {
    const header = 'Date,Sub-Level,Section,Score,Total,Accuracy %,Avg Time (s),Passed\n';
    const rows = sessions
      .map(
        (s) =>
          `${s.date},${s.subLevelId},${s.section},${s.score},${s.total},${s.accuracy},${s.avgTimeSec},${s.passed}`,
      )
      .join('\n');
    this.downloadFile(`${childName}-drill-log.csv`, 'text/csv', header + rows);
  }

  private downloadFile(filename: string, type: string, content: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
