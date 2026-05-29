import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DrillEngineService } from '../../core/drill-engine.service';
import { StorageService } from '../../core/storage.service';
import {
  Question,
  QuestionResult,
  Session,
  DrillType,
  SUB_LEVELS,
  getSubLevel,
  SubLevel,
  MCQQuestion,
  NumericQuestion,
} from '../../core/models';
import { AuthService } from '../../core/auth.service';
import { DbService } from '../../core/db.service';

@Component({
  selector: 'app-drill',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './drill.component.html',
  styleUrl: './drill.component.scss',
})
export class DrillComponent implements OnInit, OnDestroy {
  // Config
  subLevelId = 'A1';
  subLevelDef = signal<SubLevel | null>(null);
  totalQuestions = 10;

  // State
  phase = signal<'idle' | 'running' | 'finished'>('idle');
  currentQ = signal<Question | null>(null);
  qIndex = signal(0);
  userAnswer = ''; // for numeric
  selectedOption = signal(-1); // for MCQ
  feedback = signal<'correct' | 'wrong' | 'timeout' | null>(null);
  timerPct = signal(100);
  liveCorrect = signal(0);
  liveStreak = signal(0);
  bestStreak = 0;
  currentStreak = 0;

  private results: QuestionResult[] = [];
  private timerInt: any;
  private qStart = 0;

  constructor(
    private engine: DrillEngineService,
    private db: DbService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p) => {
      this.subLevelId = p['subLevelId'] ?? 'A1';
      const sl = getSubLevel(this.subLevelId);
      this.subLevelDef.set(sl ?? null);
    });
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  // ── Type guards ─────────────────────────────────────────────────────────────
  isNumeric(q: Question | null): q is NumericQuestion {
    return q?.kind === 'numeric';
  }
  isMCQ(q: Question | null): q is MCQQuestion {
    return q?.kind === 'mcq';
  }

  get correctAnswerDisplay(): string {
    const q = this.currentQ();
    if (!q) return '';
    if (q.kind === 'numeric') return String(q.answer);
    return q.options[q.correctIndex];
  }

  get timeLimitSec(): number {
    return this.subLevelDef()?.timeLimitSec ?? 10;
  }

  // ── Session control ─────────────────────────────────────────────────────────
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

  // ── Question flow ───────────────────────────────────────────────────────────
  private nextQuestion() {
    if (this.qIndex() >= this.totalQuestions) {
      this.finish();
      return;
    }
    const sl = this.subLevelDef();
    if (!sl) return;
    const q = this.engine.generate(sl.drillType);
    this.currentQ.set(q);
    this.userAnswer = '';
    this.selectedOption.set(-1);
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
      if (elapsed >= this.timeLimitSec) {
        this.clearTimer();
        this.timeUp();
      }
    }, 80);
  }

  // ── Answer submission ───────────────────────────────────────────────────────
  submitNumeric() {
    if (this.phase() !== 'running') return;
    const q = this.currentQ();
    if (!q || q.kind !== 'numeric') return;
    const val = parseFloat(this.userAnswer);
    if (isNaN(val)) return;
    this.clearTimer();
    const timeSec = parseFloat(((Date.now() - this.qStart) / 1000).toFixed(1));
    const correct = val === q.answer;
    this.recordResult(q, String(val), String(q.answer), correct, timeSec, false);
    this.feedback.set(correct ? 'correct' : 'wrong');
    setTimeout(() => this.advance(), correct ? 600 : 1400);
  }

  selectOption(index: number) {
    if (this.phase() !== 'running') return;
    const q = this.currentQ();
    if (!q || q.kind !== 'mcq') return;
    if (this.feedback()) return; // already answered
    this.clearTimer();
    this.selectedOption.set(index);
    const timeSec = parseFloat(((Date.now() - this.qStart) / 1000).toFixed(1));
    const correct = index === q.correctIndex;
    this.recordResult(q, q.options[index], q.options[q.correctIndex], correct, timeSec, false);
    this.feedback.set(correct ? 'correct' : 'wrong');
    setTimeout(() => this.advance(), correct ? 800 : 1600);
  }

  private timeUp() {
    const q = this.currentQ()!;
    const correctAns = q.kind === 'numeric' ? String(q.answer) : q.options[q.correctIndex];
    this.recordResult(q, null, correctAns, false, this.timeLimitSec, true);
    this.feedback.set('timeout');
    setTimeout(() => this.advance(), 1300);
  }

  private advance() {
    this.qIndex.update((i) => i + 1);
    if (this.qIndex() < this.totalQuestions) this.nextQuestion();
    else this.finish();
  }

  private recordResult(
    q: Question,
    userAnswer: string | null,
    expected: string,
    correct: boolean,
    timeSec: number,
    timedOut: boolean,
  ) {
    if (correct) {
      this.liveCorrect.update((c) => c + 1);
      this.currentStreak++;
      if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;
      this.liveStreak.set(this.currentStreak);
    } else {
      this.currentStreak = 0;
      this.liveStreak.set(0);
    }
    const sl = this.subLevelDef();
    this.results.push({
      question: q.display,
      expected,
      userAnswer,
      correct,
      timeSec,
      timedOut,
      drillType: q.drillType,
      subLevelId: this.subLevelId,
    });
  }

  // Replace finish() method
  private async finish() {
    this.clearTimer();
    this.phase.set('finished');
    const score = this.results.filter((r) => r.correct).length;
    const total = this.results.length;
    const accuracy = Math.round((score / total) * 100);
    const avgTime = parseFloat(
      (this.results.reduce((s, r) => s + r.timeSec, 0) / total).toFixed(1),
    );
    const sl = this.subLevelDef();
    const passed = score >= (sl?.passScore ?? 8);
    const session: Session = {
      id: `${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      subLevelId: this.subLevelId,
      drillType: sl?.drillType ?? 'add_1_1',
      section: sl?.section ?? 'addition',
      score,
      total,
      accuracy,
      avgTimeSec: avgTime,
      bestStreakInSession: this.bestStreak,
      timeLimitSec: this.timeLimitSec,
      questions: this.results,
      passed,
    };
    const childId = this.auth.childId();
    const updatedChild = childId ? await this.db.saveSession(childId, session) : null;
    if (updatedChild) await this.auth.refreshChild();
    this.router.navigate(['/summary'], {
      state: { session, student: updatedChild?.student ?? null },
    });
  }

  private clearTimer() {
    clearInterval(this.timerInt);
  }

  get timerColor(): string {
    const p = this.timerPct();
    if (p < 30) return '#993C1D';
    if (p < 60) return '#854F0B';
    return '#534AB7';
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') this.submitNumeric();
  }
}
