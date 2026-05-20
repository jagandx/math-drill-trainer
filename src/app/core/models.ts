// ─── Levels ───────────────────────────────────────────────────────────────────
export type DrillLevel = 1 | 2 | 3 | 4 | 5;

export interface Level {
  level: DrillLevel;
  name: string;
  description: string;
  color: string;
  drillTypes: DrillType[];
  timeLimitSeconds: number;
  passScore: number;       // out of 10
  passStreakRequired: number; // consecutive sessions to unlock next
}

// ─── Drill types ──────────────────────────────────────────────────────────────
export type DrillType =
  | 'add1' | 'sub1' | 'mul1' | 'div1'          // Level 1 — single digit
  | 'add2' | 'sub2' | 'mul21' | 'tables2_12'   // Level 2 — 2-digit / tables
  | 'mul22' | 'add3' | 'sub3' | 'tables13_20'  // Level 3 — advanced
  | 'mul22_hard' | 'squares' | 'tables21_25'   // Level 4 — challenger
  | 'cubes' | 'pct' | 'lcm_hcf' | 'unit_digit'; // Level 5 — olympiad

// ─── Question ─────────────────────────────────────────────────────────────────
export interface Question {
  display: string;       // e.g. "47 + 38"
  answer: number;
  drillType: DrillType;
}

// ─── Per-question result ───────────────────────────────────────────────────────
export interface QuestionResult {
  question: string;
  expected: number;
  userAnswer: number | null;
  correct: boolean;
  timeSec: number;
  timedOut: boolean;
  drillType: DrillType;
}

// ─── Session ──────────────────────────────────────────────────────────────────
export interface Session {
  id: string;
  date: string;           // ISO date string
  level: DrillLevel;
  drillType: DrillType | 'mixed';
  score: number;
  total: number;
  accuracy: number;       // percentage 0–100
  avgTimeSec: number;
  bestStreakInSession: number;
  timeLimitSec: number;
  questions: QuestionResult[];
}

// ─── Student ──────────────────────────────────────────────────────────────────
export interface Student {
  name: string;
  currentLevel: DrillLevel;
  consecutivePassCount: number;   // resets on fail
  dailyStreak: number;
  lastSessionDate: string | null;
  totalSessions: number;
  totalCorrect: number;
  badges: Badge[];
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  label: string;
  icon: string;           // emoji
  earnedDate: string;
}

// ─── Weak spots ───────────────────────────────────────────────────────────────
export interface WeakSpot {
  drillType: DrillType;
  label: string;
  errorCount: number;
  avgTimeSec: number;
}

// ─── Full app state (what we store in localStorage) ───────────────────────────
export interface AppState {
  student: Student;
  sessions: Session[];
  weakSpots: WeakSpot[];
}

// ─── Level definitions ────────────────────────────────────────────────────────
export const LEVELS: Level[] = [
  {
    level: 1,
    name: 'Starter',
    description: 'Single-digit operations',
    color: '#534AB7',
    drillTypes: ['add1', 'sub1', 'mul1', 'div1'],
    timeLimitSeconds: 5,
    passScore: 8,
    passStreakRequired: 2,
  },
  {
    level: 2,
    name: 'Builder',
    description: '2-digit add/sub · Tables 2–12',
    color: '#0F6E56',
    drillTypes: ['add2', 'sub2', 'mul21', 'tables2_12'],
    timeLimitSeconds: 8,
    passScore: 8,
    passStreakRequired: 2,
  },
  {
    level: 3,
    name: 'Achiever',
    description: '2-digit × 1-digit · Tables 13–20',
    color: '#854F0B',
    drillTypes: ['mul22', 'add3', 'sub3', 'tables13_20'],
    timeLimitSeconds: 12,
    passScore: 8,
    passStreakRequired: 2,
  },
  {
    level: 4,
    name: 'Challenger',
    description: '2-digit × 2-digit · Squares · Tables 21–25',
    color: '#993C1D',
    drillTypes: ['mul22_hard', 'squares', 'tables21_25'],
    timeLimitSeconds: 15,
    passScore: 8,
    passStreakRequired: 2,
  },
  {
    level: 5,
    name: 'Olympiad',
    description: 'Cubes · Percentages · LCM/HCF · Unit digits',
    color: '#3B6D11',
    drillTypes: ['cubes', 'pct', 'lcm_hcf', 'unit_digit'],
    timeLimitSeconds: 20,
    passScore: 8,
    passStreakRequired: 2,
  },
];

// ─── Drill type labels (for display) ─────────────────────────────────────────
export const DRILL_LABELS: Record<DrillType, string> = {
  add1:         'Single-digit Addition',
  sub1:         'Single-digit Subtraction',
  mul1:         'Single-digit Multiplication',
  div1:         'Single-digit Division',
  add2:         '2-digit Addition',
  sub2:         '2-digit Subtraction',
  mul21:        '2-digit × 1-digit',
  tables2_12:   'Tables 2–12',
  mul22:        '2-digit × 2-digit',
  add3:         '3-digit Addition',
  sub3:         '3-digit Subtraction',
  tables13_20:  'Tables 13–20',
  mul22_hard:   '2-digit × 2-digit (Hard)',
  squares:      'Squares 1–25',
  tables21_25:  'Tables 21–25',
  cubes:        'Cubes 1–15',
  pct:          'Percentages',
  lcm_hcf:      'LCM & HCF',
  unit_digit:   'Unit Digit Patterns',
};