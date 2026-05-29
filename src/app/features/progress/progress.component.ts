import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { DbService }   from '../../core/db.service';
import { AuthService } from '../../core/auth.service';
import {
  SECTIONS, SUB_LEVELS, Session, DrillType,
  DRILL_LABELS, getSubLevelsForSection, SubLevel,
  isSectionComplete, isSectionUnlocked, Section
} from '../../core/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss',
})
export class ProgressComponent implements OnInit, AfterViewInit {
  @ViewChild('accuracyChart') chartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('speedChart')    speedRef!: ElementRef<HTMLCanvasElement>;

  sections       = SECTIONS;
  sessions       = signal<Session[]>([]);
  weakSpots      = signal<any[]>([]);
  expandedSl     = signal<string | null>(null); // which sub-level panel is open
  chart: any;
  speedChart: any;

  constructor(private db: DbService, private auth: AuthService) {}

  async ngOnInit() {
    await this.auth.refreshChild();
    const child = this.auth.child();
    if (!child) return;
    const s = await this.db.getSessionsForChild(child.id);
    this.sessions.set(s as Session[]);
    this.weakSpots.set(child.weakSpots ?? []);
  }

  ngAfterViewInit() { this.buildCharts(); }

  get student()  { return this.auth.child()?.student; }
  get progress() { return this.student?.subLevelProgress ?? {}; }

  get last10() { return this.sessions().slice(-10); }

  get totalAccuracy() {
    const s = this.sessions();
    if (!s.length) return 0;
    return Math.round(s.reduce((a,b) => a + b.accuracy, 0) / s.length);
  }
  get bestScore() {
    return this.sessions().length ? Math.max(...this.sessions().map(s => s.score)) : 0;
  }
  get avgSpeed() {
    const s = this.sessions();
    if (!s.length) return 0;
    return parseFloat((s.reduce((a,b) => a + b.avgTimeSec, 0) / s.length).toFixed(1));
  }

  // ── Sub-level helpers ────────────────────────────────────────────────────
  subLevelsForSection(sectionId: string): SubLevel[] {
    return getSubLevelsForSection(sectionId as Section);
  }
  isSecComplete(sectionId: string) {
    return isSectionComplete(sectionId as Section, this.progress);
  }
  isSecUnlocked(sectionId: string) {
    return isSectionUnlocked(sectionId as Section, this.progress);
  }
  slDone(id: string)      { return this.progress[id]?.completed ?? false; }
  slUnlocked(id: string)  { return this.progress[id]?.unlocked  ?? false; }
  slAttempts(id: string)  { return this.progress[id]?.attempts  ?? 0; }
  slBestAcc(id: string)   { return this.progress[id]?.bestAccuracy ?? 0; }
  slPassStreak(id: string){ return this.progress[id]?.consecutivePassCount ?? 0; }

  // Sessions for a specific sub-level
  sessionsForSubLevel(slId: string): Session[] {
    return this.sessions()
      .filter(s => s.subLevelId === slId)
      .slice()
      .reverse();
  }

  toggleSubLevel(id: string) {
    this.expandedSl.set(this.expandedSl() === id ? null : id);
  }

  sectionColor(id: string) {
    return SECTIONS.find(s => s.id === id)?.color ?? '#534AB7';
  }
  drillLabel(type: DrillType | string) {
    return DRILL_LABELS[type as DrillType] ?? type;
  }

  private buildCharts() {
    const sessions = this.last10;
    if (!sessions.length) return;
    const labels   = sessions.map((_,i) => `S${i+1}`);
    const accuracy = sessions.map(s => s.accuracy);
    const speeds   = sessions.map(s => s.avgTimeSec);

    if (this.chartRef?.nativeElement) {
      this.chart = new Chart(this.chartRef.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Accuracy %', data: accuracy,
            borderColor: '#534AB7', backgroundColor: '#534AB733',
            fill: true, tension: 0.4,
            pointBackgroundColor: accuracy.map(a => a>=80?'#3B6D11':a>=60?'#854F0B':'#993C1D'),
            pointRadius: 5,
          }]
        },
        options: {
          responsive: true,
          scales: { y: { min:0, max:100, ticks:{ callback: v => v+'%' } } },
          plugins: { legend: { display: false } }
        }
      });
    }
    if (this.speedRef?.nativeElement) {
      this.speedChart = new Chart(this.speedRef.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Avg time (s)', data: speeds,
            backgroundColor: '#0F6E5666', borderColor: '#0F6E56',
            borderWidth: 1, borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          scales: { y: { min:0 } },
          plugins: { legend: { display: false } }
        }
      });
    }
  }
}