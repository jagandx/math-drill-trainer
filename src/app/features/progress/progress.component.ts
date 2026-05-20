import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { StorageService } from '../../core/storage.service';
import { AppState, LEVELS, Session, DrillType, DRILL_LABELS } from '../../core/models';
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

  state       = signal<AppState | null>(null);
  levels      = LEVELS;
  chart: any  = null;
  speedChart: any = null;

  constructor(private storage: StorageService) {}

  ngOnInit() {
    this.state.set(this.storage.load());
  }

  ngAfterViewInit() {
    this.buildCharts();
  }

  get student()  { return this.state()?.student; }
  get sessions() { return this.state()?.sessions ?? []; }
  get weakSpots(){ return this.state()?.weakSpots ?? []; }

  get last10Sessions(): Session[] {
    return this.sessions.slice(-10);
  }

  get currentLevelDef() {
    return LEVELS.find(l => l.level === this.student?.currentLevel);
  }

  get totalAccuracy(): number {
    if (!this.sessions.length) return 0;
    const total = this.sessions.reduce((s, r) => s + r.accuracy, 0);
    return Math.round(total / this.sessions.length);
  }

  get bestScore(): number {
    if (!this.sessions.length) return 0;
    return Math.max(...this.sessions.map(s => s.score));
  }

  get avgSpeed(): number {
    if (!this.sessions.length) return 0;
    const total = this.sessions.reduce((s, r) => s + r.avgTimeSec, 0);
    return parseFloat((total / this.sessions.length).toFixed(1));
  }

  get levelProgress(): number {
    return ((this.student?.consecutivePassCount ?? 0) / 2) * 100;
  }

  levelColor(level: number): string {
    return LEVELS.find(l => l.level === level)?.color ?? '#534AB7';
  }

  isUnlocked(level: number): boolean {
    return (this.student?.currentLevel ?? 1) >= level;
  }

  isCurrent(level: number): boolean {
    return this.student?.currentLevel === level;
  }

  drillLabel(type: DrillType | 'mixed'): string {
    return type === 'mixed' ? 'Mixed' : DRILL_LABELS[type] ?? type;
  }

  private buildCharts() {
    const sessions = this.last10Sessions;
    if (!sessions.length) return;

    const labels   = sessions.map((s, i) => `S${i + 1}`);
    const accuracy = sessions.map(s => s.accuracy);
    const speeds   = sessions.map(s => s.avgTimeSec);

    // Accuracy chart
    if (this.chartRef?.nativeElement) {
      this.chart = new Chart(this.chartRef.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Accuracy %',
            data: accuracy,
            borderColor: '#534AB7',
            backgroundColor: '#534AB733',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: accuracy.map(a =>
              a >= 80 ? '#3B6D11' : a >= 60 ? '#854F0B' : '#993C1D'
            ),
            pointRadius: 5,
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { min: 0, max: 100, ticks: { callback: v => v + '%' } }
          },
          plugins: { legend: { display: false } }
        }
      });
    }

    // Speed chart
    if (this.speedRef?.nativeElement) {
      this.speedChart = new Chart(this.speedRef.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Avg time (s)',
            data: speeds,
            backgroundColor: '#0F6E5666',
            borderColor: '#0F6E56',
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          scales: { y: { min: 0 } },
          plugins: { legend: { display: false } }
        }
      });
    }
  }
}