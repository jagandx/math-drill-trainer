import { Injectable } from '@angular/core';
import { AppState, Student, Session, WeakSpot, DrillType, QuestionResult, DRILL_LABELS } from './models';

const STORAGE_KEY = 'math_drill_trainer_v1';

const DEFAULT_STATE: AppState = {
  student: {
    name: '',
    currentLevel: 1,
    consecutivePassCount: 0,
    dailyStreak: 0,
    lastSessionDate: null,
    totalSessions: 0,
    totalCorrect: 0,
    badges: [],
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
    const last  = state.student.lastSessionDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (last === today) {
      // already played today — no change to streak
    } else if (last === yesterday) {
      state.student.dailyStreak++;
    } else {
      state.student.dailyStreak = 1;
    }
    state.student.lastSessionDate = today;

    // Level progression
    const passed = session.accuracy >= (session.score >= 8 ? 80 : 100);
    const passedSession = session.score >= 8;
    if (passedSession) {
      state.student.consecutivePassCount++;
    } else {
      state.student.consecutivePassCount = 0;
    }

    // Unlock next level after 2 consecutive passes
    if (
      state.student.consecutivePassCount >= 2 &&
      state.student.currentLevel < 5
    ) {
      state.student.currentLevel = (state.student.currentLevel + 1) as any;
      state.student.consecutivePassCount = 0;
      state.student.badges.push({
        id: `level_${state.student.currentLevel}`,
        label: `Level ${state.student.currentLevel} Unlocked!`,
        icon: '🏆',
        earnedDate: today,
      });
    }

    // Update weak spots
    state.weakSpots = this.computeWeakSpots(state.sessions);

    this.save(state);
    return state;
  }

  // ─── Weak spots ──────────────────────────────────────────────────────────────
  private computeWeakSpots(sessions: Session[]): WeakSpot[] {
    const map = new Map<DrillType, { errors: number; totalTime: number; count: number }>();

    for (const session of sessions.slice(-20)) {   // last 20 sessions
      for (const q of session.questions) {
        const entry = map.get(q.drillType) ?? { errors: 0, totalTime: 0, count: 0 };
        if (!q.correct) entry.errors++;
        entry.totalTime += q.timeSec;
        entry.count++;
        map.set(q.drillType, entry);
      }
    }

    return Array.from(map.entries())
      .map(([drillType, data]) => ({
        drillType,
        label: DRILL_LABELS[drillType],
        errorCount: data.errors,
        avgTimeSec: parseFloat((data.totalTime / data.count).toFixed(1)),
      }))
      .filter(w => w.errorCount > 0)
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
    const header = 'Date,Level,Drill Type,Score,Total,Accuracy %,Avg Time (s),Best Streak\n';
    const rows = sessions.map(s =>
      `${s.date},${s.level},${s.drillType},${s.score},${s.total},${s.accuracy},${s.avgTimeSec},${s.bestStreakInSession}`
    ).join('\n');
    this.downloadFile('drill-log.csv', 'text/csv', header + rows);
  }

  private downloadFile(filename: string, type: string, content: string): void {
    const blob = new Blob([content], { type });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
}