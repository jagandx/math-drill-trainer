import { Component, OnInit, signal } from '@angular/core';
import { StorageService } from '../../core/storage.service';
import { AppState, Session, SECTIONS, DRILL_LABELS, DrillType } from '../../core/models';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [],
  templateUrl: './parent.component.html',
  styleUrl: './parent.component.scss',
})
export class ParentComponent implements OnInit {
  state = signal<AppState | null>(null);
  Math  = Math;

  constructor(private storage: StorageService) {}

  ngOnInit() { this.state.set(this.storage.load()); }

  get student()   { return this.state()?.student; }
  get sessions()  { return (this.state()?.sessions ?? []).slice().reverse(); }
  get weakSpots() { return this.state()?.weakSpots ?? []; }

  get currentSubLevelId() { return this.student?.currentSubLevelId ?? 'A1'; }
  get totalSessions()     { return this.state()?.sessions.length ?? 0; }

  get avgAccuracy(): number {
    const s = this.state()?.sessions ?? [];
    if (!s.length) return 0;
    return Math.round(s.reduce((a,b) => a + b.accuracy, 0) / s.length);
  }
  get passRate(): number {
    const s = this.state()?.sessions ?? [];
    if (!s.length) return 0;
    return Math.round((s.filter(x => x.passed).length / s.length) * 100);
  }
  get improvementTrend(): string {
    const s = this.state()?.sessions ?? [];
    if (s.length < 4) return '—';
    const half     = Math.floor(s.length / 2);
    const firstAvg = s.slice(0, half).reduce((a,b) => a + b.accuracy, 0) / half;
    const lastAvg  = s.slice(half).reduce((a,b) => a + b.accuracy, 0) / (s.length - half);
    const diff     = Math.round(lastAvg - firstAvg);
    return diff > 0 ? `+${diff}%` : `${diff}%`;
  }

  sectionColor(sectionId: string): string {
    return SECTIONS.find(s => s.id === sectionId)?.color ?? '#534AB7';
  }

  drillLabel(type: DrillType): string {
    return DRILL_LABELS[type] ?? type;
  }

  downloadCSV() {
    this.storage.exportCSV(this.state()?.sessions ?? []);
  }

  downloadReport() {
    const s = this.state();
    if (!s) return;
    const student  = s.student;
    const sessions = s.sessions;
    const lines = [
      '============================================',
      '     MATH DRILL TRAINER — PROGRESS REPORT  ',
      '============================================',
      '',
      `Student        : ${student.name}`,
      `Current Sub-Level: ${student.currentSubLevelId}`,
      `Daily Streak   : ${student.dailyStreak} days`,
      `Total Sessions : ${student.totalSessions}`,
      `Total Correct  : ${student.totalCorrect}`,
      `Report Date    : ${new Date().toLocaleDateString()}`,
      '',
      '── OVERALL STATS ──────────────────────────',
      `Average Accuracy : ${this.avgAccuracy}%`,
      `Pass Rate        : ${this.passRate}%`,
      `Improvement      : ${this.improvementTrend}`,
      '',
      '── WEAK SPOTS ─────────────────────────────',
      ...s.weakSpots.map(w => `  ${w.label}: ${w.errorCount} errors, avg ${w.avgTimeSec}s`),
      '',
      '── SESSION LOG ────────────────────────────',
      'Date       | Sub-Level | Score | Accuracy | Avg Time | Passed',
      '-'.repeat(65),
      ...sessions.map(x =>
        `${x.date} | ${x.subLevelId.padEnd(9)} | ${x.score}/${x.total}  | ${String(x.accuracy+'%').padEnd(9)}| ${x.avgTimeSec}s    | ${x.passed ? 'Yes' : 'No'}`
      ),
      '',
      '── BADGES ─────────────────────────────────',
      ...student.badges.map(b => `  ${b.icon} ${b.label} — ${b.earnedDate}`),
      '',
      '============================================',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${student.name}-drill-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}