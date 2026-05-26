import { Injectable } from '@angular/core';
import {
  AppState,
  Student,
  Session,
  WeakSpot,
  DrillType,
  DRILL_LABELS,
  SUB_LEVELS,
  SubLevelProgress,
  buildInitialProgress,
  getSubLevel,
  getNextSubLevel,
  isSectionComplete,
  isSectionUnlocked,
} from './models';

const STORAGE_KEY = 'math_drill_trainer_v1';

const DEFAULT_STATE: AppState = {
  student: {
    name: '',
    dailyStreak: 0,
    lastSessionDate: null,
    totalSessions: 0,
    totalCorrect: 0,
    badges: [],
    subLevelProgress: buildInitialProgress(),
    currentSubLevelId: 'A1',
  },
  sessions: [],
  weakSpots: [],
};

@Injectable({ providedIn: 'root' })
export class StorageService {
  // ─── Load / Save ────────────────────────────────────────────────────────────
  load(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      return JSON.parse(raw) as AppState;
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }

  save(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Storage save failed', e);
    }
  }

  // ─── Session ────────────────────────────────────────────────────────────────
  saveSession(session: Session): AppState {
    const state = this.load();
    state.sessions.push(session);
    state.student.totalSessions++;
    state.student.totalCorrect += session.score;

    // Daily streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const last = state.student.lastSessionDate;
    if (last === today) {
      // no change
    } else if (last === yesterday) {
      state.student.dailyStreak++;
    } else {
      state.student.dailyStreak = 1;
    }
    state.student.lastSessionDate = today;

    // Sub-level progress
    const slId = session.subLevelId;
    const slDef = getSubLevel(slId);
    const prog = state.student.subLevelProgress[slId];

    if (prog && slDef) {
      prog.attempts++;
      prog.bestAccuracy = Math.max(prog.bestAccuracy, session.accuracy);
      prog.bestTimeSec = Math.min(prog.bestTimeSec, session.avgTimeSec);

      if (session.passed) {
        prog.consecutivePassCount++;
      } else {
        prog.consecutivePassCount = 0;
      }

      // Completed this sub-level?
      if (!prog.completed && prog.consecutivePassCount >= slDef.passStreakRequired) {
        prog.completed = true;

        // Badge for completing sub-level
        state.student.badges.push({
          id: `complete_${slId}`,
          label: `${slId} Complete!`,
          icon: '⭐',
          earnedDate: today,
        });

        // Unlock next sub-level
        const next = getNextSubLevel(slId);
        if (next) {
          const nextProg = state.student.subLevelProgress[next.id];
          if (nextProg && !nextProg.unlocked) {
            nextProg.unlocked = true;
            // Also unlock first of intelligence always
          }
          // Move current to next
          state.student.currentSubLevelId = next.id;
        }

        // Section complete badge
        const sl = getSubLevel(slId);
        if (sl && isSectionComplete(sl.section, state.student.subLevelProgress)) {
          state.student.badges.push({
            id: `section_${sl.section}`,
            label: `${sl.section} Mastered!`,
            icon: '🏆',
            earnedDate: today,
          });
        }
      }
    }

    // Weak spots
    state.weakSpots = this.computeWeakSpots(state.sessions);

    this.save(state);
    return state;
  }

  // ─── Weak spots ──────────────────────────────────────────────────────────────
  private computeWeakSpots(sessions: Session[]): WeakSpot[] {
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
  // ─── Student ────────────────────────────────────────────────────────────────
  updateStudent(patch: Partial<Student>): void {
    const state = this.load();
    state.student = { ...state.student, ...patch };
    this.save(state);
  }

  // ─── Reset ──────────────────────────────────────────────────────────────────
  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ─── Export CSV ─────────────────────────────────────────────────────────────
exportCSV(sessions: Session[]): void {
  const header = 'Date,Sub-Level,Section,Score,Total,Accuracy %,Avg Time (s),Passed\n';
  const rows   = sessions.map(s =>
    `${s.date},${s.subLevelId},${s.section},${s.score},${s.total},${s.accuracy},${s.avgTimeSec},${s.passed}`
  ).join('\n');
  this.downloadFile('drill-log.csv', 'text/csv', header + rows);
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
