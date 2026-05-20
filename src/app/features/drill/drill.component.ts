import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DrillEngineService } from '../../core/drill-engine.service';
import { StorageService } from '../../core/storage.service';
import { FormsModule } from '@angular/forms';
import { Question, QuestionResult, Session, DrillType, DrillLevel, LEVELS } from '../../core/models';

@Component({
  selector: 'app-drill',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './drill.component.html',
  styleUrl: './drill.component.scss',
})
export class DrillComponent implements OnInit, OnDestroy {
  // Config
  drillType: DrillType | 'mixed' = 'mixed';
  level: DrillLevel = 1;
  totalQuestions = 10;
  timeLimitSec   = 10;

  // State
  phase = signal<'idle' | 'running' | 'finished'>('idle');
  currentQ    = signal<Question | null>(null);
  qIndex      = signal(0);
  userAnswer  = '';
  feedback    = signal<'correct' | 'wrong' | 'timeout' | null>(null);
  timerPct    = signal(100);
  liveCorrect = signal(0);
  liveStreak  = signal(0);
  bestStreak  = 0;
  currentStreak = 0;

  private results: QuestionResult[] = [];
  private timerInt: any;
  private qStart = 0;

  constructor(
    private engine: DrillEngineService,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.drillType    = (p['type'] as DrillType) ?? 'mixed';
      this.level        = (parseInt(p['level']) as DrillLevel) ?? 1;
      const levelDef    = LEVELS.find(l => l.level === this.level);
      this.timeLimitSec = levelDef?.timeLimitSeconds ?? 10;
    });
  }

  ngOnDestroy() { this.clearTimer(); }

  start() {
    this.results = [];
    this.qIndex.set(0);
    this.liveCorrect.set(0);
    this.liveStreak.set(0);
    this.bestStreak = 0;
    this.currentStreak = 0;
    this.phase.set('running');
    this.nextQuestion();
  }

  stop() {
    this.clearTimer();
    if (this.results.length > 0) this.finish();
    else this.phase.set('idle');
  }

  private nextQuestion() {
    if (this.qIndex() >= this.totalQuestions) { this.finish(); return; }
    const q = this.engine.generate(
      this.drillType === 'mixed'
        ? (LEVELS.find(l => l.level === this.level)?.drillTypes[
            Math.floor(Math.random() * 4)] ?? 'add1')
        : this.drillType
    );
    this.currentQ.set(q);
    this.userAnswer = '';
    this.feedback.set(null);
    this.qStart = Date.now();
    this.startTimer();
  }

  private startTimer() {
    this.clearTimer();
    this.timerPct.set(100);
    this.timerInt = setInterval(() => {
      const elapsed = (Date.now() - this.qStart) / 1000;
      const pct = Math.max(0, 100 - (elapsed / this.timeLimitSec) * 100);
      this.timerPct.set(pct);
      if (elapsed >= this.timeLimitSec) { this.clearTimer(); this.timeUp(); }
    }, 80);
  }

  submit() {
    if (this.phase() !== 'running') return;
    const val = parseInt(this.userAnswer);
    if (isNaN(val)) return;
    this.clearTimer();
    const timeSec = parseFloat(((Date.now() - this.qStart) / 1000).toFixed(1));
    const q = this.currentQ()!;
    const correct = val === q.answer;
    this.recordResult(q, val, correct, timeSec, false);
    this.feedback.set(correct ? 'correct' : 'wrong');
    setTimeout(() => this.advance(), correct ? 600 : 1400);
  }

  private timeUp() {
    const q = this.currentQ()!;
    this.recordResult(q, null, false, this.timeLimitSec, true);
    this.feedback.set('timeout');
    setTimeout(() => this.advance(), 1300);
  }

  private advance() {
    this.qIndex.update(i => i + 1);
    if (this.qIndex() < this.totalQuestions) this.nextQuestion();
    else this.finish();
  }

  private recordResult(q: Question, userAnswer: number | null, correct: boolean, timeSec: number, timedOut: boolean) {
    if (correct) {
      this.liveCorrect.update(c => c + 1);
      this.currentStreak++;
      if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;
      this.liveStreak.set(this.currentStreak);
    } else {
      this.currentStreak = 0;
      this.liveStreak.set(0);
    }
    this.results.push({
      question: q.display, expected: q.answer,
      userAnswer, correct, timeSec, timedOut, drillType: q.drillType,
    });
  }

  private finish() {
    this.clearTimer();
    this.phase.set('finished');
    const score    = this.results.filter(r => r.correct).length;
    const total    = this.results.length;
    const accuracy = Math.round((score / total) * 100);
    const avgTime  = parseFloat(
      (this.results.reduce((s, r) => s + r.timeSec, 0) / total).toFixed(1)
    );
    const session: Session = {
      id:      `${Date.now()}`,
      date:    new Date().toISOString().split('T')[0],
      level:   this.level,
      drillType: this.drillType,
      score, total, accuracy, avgTimeSec: avgTime,
      bestStreakInSession: this.bestStreak,
      timeLimitSec: this.timeLimitSec,
      questions: this.results,
    };
    const newState = this.storage.saveSession(session);
    this.router.navigate(['/summary'], {
      state: { session, student: newState.student }
    });
  }

  private clearTimer() { clearInterval(this.timerInt); }

  get timerColor(): string {
    const p = this.timerPct();
    if (p < 30) return '#993C1D';
    if (p < 60) return '#854F0B';
    return '#534AB7';
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') this.submit();
  }
}