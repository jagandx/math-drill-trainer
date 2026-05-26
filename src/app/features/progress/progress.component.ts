import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { StorageService } from '../../core/storage.service';
import { AppState, SECTIONS, SUB_LEVELS, Session,
         DrillType, DRILL_LABELS, getSubLevelsForSection,
         isSectionComplete, isSectionUnlocked } from '../../core/models';
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

  state    = signal<AppState | null>(null);
  sections = SECTIONS;
  chart: any; speedChart: any;

  constructor(private storage: StorageService) {}

  ngOnInit()       { this.state.set(this.storage.load()); }
  ngAfterViewInit(){ this.buildCharts(); }

  get student()   { return this.state()?.student; }
  get sessions()  { return this.state()?.sessions ?? []; }
  get weakSpots() { return this.state()?.weakSpots ?? []; }
  get progress()  { return this.student?.subLevelProgress ?? {}; }
  get last10()    { return this.sessions.slice(-10); }

  get totalAccuracy() {
    if (!this.sessions.length) return 0;
    return Math.round(this.sessions.reduce((s,r) => s+r.accuracy, 0) / this.sessions.length);
  }
  get bestScore() {
    return this.sessions.length ? Math.max(...this.sessions.map(s => s.score)) : 0;
  }
  get avgSpeed() {
    if (!this.sessions.length) return 0;
    return parseFloat((this.sessions.reduce((s,r) => s+r.avgTimeSec, 0) / this.sessions.length).toFixed(1));
  }

  subLevelsForSection(sectionId: string) {
    return getSubLevelsForSection(sectionId as any);
  }
  isSecComplete(sectionId: string) {
    return isSectionComplete(sectionId as any, this.progress);
  }
  isSecUnlocked(sectionId: string) {
    return isSectionUnlocked(sectionId as any, this.progress);
  }
  slDone(id: string)     { return this.progress[id]?.completed ?? false; }
  slUnlocked(id: string) { return this.progress[id]?.unlocked ?? false; }
  slAttempts(id: string) { return this.progress[id]?.attempts ?? 0; }
  slBestAcc(id: string)  { return this.progress[id]?.bestAccuracy ?? 0; }
  slPassStreak(id: string) { return this.progress[id]?.consecutivePassCount ?? 0; }

  sectionColor(id: string) {
    return SECTIONS.find(s => s.id === id)?.color ?? '#534AB7';
  }

  drillLabel(type: DrillType | 'mixed') {
    return type === 'mixed' ? 'Mixed' : DRILL_LABELS[type] ?? type;
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
            label: 'Accuracy %',
            data: accuracy,
            borderColor: '#534AB7',
            backgroundColor: '#534AB733',
            fill: true, tension: 0.4,
            pointBackgroundColor: accuracy.map(a => a>=80?'#3B6D11':a>=60?'#854F0B':'#993C1D'),
            pointRadius: 5,
          }]
        },
        options: {
          responsive: true,
          scales: { y: { min:0, max:100, ticks: { callback: v => v+'%' } } },
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
            label: 'Avg time (s)',
            data: speeds,
            backgroundColor: '#0F6E5666',
            borderColor: '#0F6E56',
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