// ─── Sub-level drill types ────────────────────────────────────────────────────

export type DrillType =
  // ── Addition (A1–A5)
  | 'add_1_1' // 1-digit + 1-digit
  | 'add_2_1' // 2-digit + 1-digit
  | 'add_2_2' // 2-digit + 2-digit
  | 'add_3_2' // 3-digit + 2-digit
  | 'add_3_3' // 3-digit + 3-digit

  // ── Subtraction (S1–S5)
  | 'sub_1_1' // 1-digit − 1-digit
  | 'sub_2_1' // 2-digit − 1-digit
  | 'sub_2_2' // 2-digit − 2-digit
  | 'sub_3_2' // 3-digit − 2-digit
  | 'sub_3_3' // 3-digit − 3-digit

  // ── Multiplication (M1–M6)
  | 'mul_1_1' // 1-digit × 1-digit
  | 'mul_2_1' // 2-digit × 1-digit
  | 'mul_2_2' // 2-digit × 2-digit
  | 'mul_3_1' // 3-digit × 1-digit
  | 'mul_3_2' // 3-digit × 2-digit
  | 'mul_3_3' // 3-digit × 3-digit

  // ── Division (D1–D5)
  | 'div_basic' // tables-based: 56÷7
  | 'div_2_1' // 2-digit ÷ 1-digit
  | 'div_3_1' // 3-digit ÷ 1-digit
  | 'div_3_2' // 3-digit ÷ 2-digit
  | 'div_4_2' // 4-digit ÷ 2-digit

  // ── Fractions (F1–F5)
  | 'frac_same' // same denominator add/sub
  | 'frac_diff' // different denominator add/sub
  | 'frac_multiply' // multiply fractions
  | 'frac_divide' // divide fractions
  | 'frac_compare' // compare / simplify

  // ── Decimals & BODMAS (Dec1–Dec4)
  | 'dec_add_sub' // decimal add/subtract
  | 'dec_multiply' // decimal multiply
  | 'bodmas' // simplification with brackets
  | 'roman' // Roman numerals

  // ── Applied Math (AP1–AP8)
  | 'percentage' // find %, % of number
  | 'ratio' // ratio and proportion
  | 'unitary' // unitary method
  | 'average' // find average
  | 'simple_interest' // SI = PRT/100
  | 'profit_loss' // CP, SP, profit%, loss%
  | 'speed_time' // S=D/T
  | 'unit_convert' // km↔m, kg↔g, °C↔°F

  // ── Geometry (G1–G4)
  | 'area_perimeter' // square, rectangle, triangle
  | 'volume' // cube, cuboid
  | 'angles' // complementary, supplementary
  | 'shapes' // identify plane/solid shapes

  // ── Intelligence / Reasoning (R1–R12)
  | 'series_number' // number series: 2,4,8,?
  | 'series_letter' // letter series: A,C,E,?
  | 'series_mixed' // mixed: A1,B2,C3,?
  | 'analogy_math' // 2:4 :: 3:?
  | 'analogy_verbal' // Dog:Bark :: Cat:?
  | 'missing_number' // matrix/figure missing number
  | 'odd_one_out' // which doesn't belong
  | 'coding' // if A=1,B=2 then CAB=?
  | 'direction' // N/S/E/W problems
  | 'ranking' // 5th from left, 6th from right
  | 'calendar' // day of week problems
  | 'mirror' // mirror image MCQ

  // ── Olympiad extras
  | 'squares' // squares 1–25
  | 'cubes' // cubes 1–15
  | 'lhcf' // LCM & HCF
  | 'unit_digit'; // unit digit patterns

// ─── Sub-level definition ────────────────────────────────────────────────────
export interface SubLevel {
  id: string; // e.g. 'A1', 'S3', 'R7'
  label: string; // e.g. '1-digit + 1-digit'
  drillType: DrillType;
  timeLimitSec: number;
  passScore: number; // out of 10
  passStreakRequired: number;
  section: Section;
}

export type Section =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'fractions'
  | 'decimals'
  | 'applied'
  | 'geometry'
  | 'intelligence'
  | 'olympiad';

// ─── All sub-levels in order ─────────────────────────────────────────────────
export const SUB_LEVELS: SubLevel[] = [
  // ── ADDITION
  {
    id: 'A1',
    label: '1-digit + 1-digit',
    drillType: 'add_1_1',
    timeLimitSec: 3,
    passScore: 8,
    passStreakRequired: 2,
    section: 'addition',
  },
  {
    id: 'A2',
    label: '2-digit + 1-digit',
    drillType: 'add_2_1',
    timeLimitSec: 5,
    passScore: 8,
    passStreakRequired: 2,
    section: 'addition',
  },
  {
    id: 'A3',
    label: '2-digit + 2-digit',
    drillType: 'add_2_2',
    timeLimitSec: 8,
    passScore: 8,
    passStreakRequired: 2,
    section: 'addition',
  },
  {
    id: 'A4',
    label: '3-digit + 2-digit',
    drillType: 'add_3_2',
    timeLimitSec: 12,
    passScore: 8,
    passStreakRequired: 2,
    section: 'addition',
  },
  {
    id: 'A5',
    label: '3-digit + 3-digit',
    drillType: 'add_3_3',
    timeLimitSec: 15,
    passScore: 8,
    passStreakRequired: 2,
    section: 'addition',
  },

  // ── SUBTRACTION
  {
    id: 'S1',
    label: '1-digit − 1-digit',
    drillType: 'sub_1_1',
    timeLimitSec: 3,
    passScore: 8,
    passStreakRequired: 2,
    section: 'subtraction',
  },
  {
    id: 'S2',
    label: '2-digit − 1-digit',
    drillType: 'sub_2_1',
    timeLimitSec: 5,
    passScore: 8,
    passStreakRequired: 2,
    section: 'subtraction',
  },
  {
    id: 'S3',
    label: '2-digit − 2-digit',
    drillType: 'sub_2_2',
    timeLimitSec: 8,
    passScore: 8,
    passStreakRequired: 2,
    section: 'subtraction',
  },
  {
    id: 'S4',
    label: '3-digit − 2-digit',
    drillType: 'sub_3_2',
    timeLimitSec: 12,
    passScore: 8,
    passStreakRequired: 2,
    section: 'subtraction',
  },
  {
    id: 'S5',
    label: '3-digit − 3-digit',
    drillType: 'sub_3_3',
    timeLimitSec: 15,
    passScore: 8,
    passStreakRequired: 2,
    section: 'subtraction',
  },

  // ── MULTIPLICATION
  {
    id: 'M1',
    label: '1-digit × 1-digit',
    drillType: 'mul_1_1',
    timeLimitSec: 3,
    passScore: 8,
    passStreakRequired: 2,
    section: 'multiplication',
  },
  {
    id: 'M2',
    label: '2-digit × 1-digit',
    drillType: 'mul_2_1',
    timeLimitSec: 6,
    passScore: 8,
    passStreakRequired: 2,
    section: 'multiplication',
  },
  {
    id: 'M3',
    label: '2-digit × 2-digit',
    drillType: 'mul_2_2',
    timeLimitSec: 15,
    passScore: 8,
    passStreakRequired: 2,
    section: 'multiplication',
  },
  {
    id: 'M4',
    label: '3-digit × 1-digit',
    drillType: 'mul_3_1',
    timeLimitSec: 10,
    passScore: 8,
    passStreakRequired: 2,
    section: 'multiplication',
  },
  {
    id: 'M5',
    label: '3-digit × 2-digit',
    drillType: 'mul_3_2',
    timeLimitSec: 25,
    passScore: 8,
    passStreakRequired: 2,
    section: 'multiplication',
  },
  {
    id: 'M6',
    label: '3-digit × 3-digit',
    drillType: 'mul_3_3',
    timeLimitSec: 40,
    passScore: 8,
    passStreakRequired: 2,
    section: 'multiplication',
  },

  // ── DIVISION
  {
    id: 'D1',
    label: 'Tables based (56÷7)',
    drillType: 'div_basic',
    timeLimitSec: 3,
    passScore: 8,
    passStreakRequired: 2,
    section: 'division',
  },
  {
    id: 'D2',
    label: '2-digit ÷ 1-digit',
    drillType: 'div_2_1',
    timeLimitSec: 6,
    passScore: 8,
    passStreakRequired: 2,
    section: 'division',
  },
  {
    id: 'D3',
    label: '3-digit ÷ 1-digit',
    drillType: 'div_3_1',
    timeLimitSec: 10,
    passScore: 8,
    passStreakRequired: 2,
    section: 'division',
  },
  {
    id: 'D4',
    label: '3-digit ÷ 2-digit',
    drillType: 'div_3_2',
    timeLimitSec: 20,
    passScore: 8,
    passStreakRequired: 2,
    section: 'division',
  },
  {
    id: 'D5',
    label: '4-digit ÷ 2-digit',
    drillType: 'div_4_2',
    timeLimitSec: 30,
    passScore: 8,
    passStreakRequired: 2,
    section: 'division',
  },

  // ── FRACTIONS
  {
    id: 'F1',
    label: 'Add/sub — same denominator',
    drillType: 'frac_same',
    timeLimitSec: 10,
    passScore: 8,
    passStreakRequired: 2,
    section: 'fractions',
  },
  {
    id: 'F2',
    label: 'Add/sub — diff denominator',
    drillType: 'frac_diff',
    timeLimitSec: 15,
    passScore: 8,
    passStreakRequired: 2,
    section: 'fractions',
  },
  {
    id: 'F3',
    label: 'Multiply fractions',
    drillType: 'frac_multiply',
    timeLimitSec: 15,
    passScore: 8,
    passStreakRequired: 2,
    section: 'fractions',
  },
  {
    id: 'F4',
    label: 'Divide fractions',
    drillType: 'frac_divide',
    timeLimitSec: 15,
    passScore: 8,
    passStreakRequired: 2,
    section: 'fractions',
  },
  {
    id: 'F5',
    label: 'Compare and simplify',
    drillType: 'frac_compare',
    timeLimitSec: 12,
    passScore: 8,
    passStreakRequired: 2,
    section: 'fractions',
  },

  // ── DECIMALS & BODMAS
  {
    id: 'Dec1',
    label: 'Decimal add/subtract',
    drillType: 'dec_add_sub',
    timeLimitSec: 12,
    passScore: 8,
    passStreakRequired: 2,
    section: 'decimals',
  },
  {
    id: 'Dec2',
    label: 'Decimal multiply',
    drillType: 'dec_multiply',
    timeLimitSec: 15,
    passScore: 8,
    passStreakRequired: 2,
    section: 'decimals',
  },
  {
    id: 'Dec3',
    label: 'BODMAS simplification',
    drillType: 'bodmas',
    timeLimitSec: 20,
    passScore: 8,
    passStreakRequired: 2,
    section: 'decimals',
  },
  {
    id: 'Dec4',
    label: 'Roman numerals',
    drillType: 'roman',
    timeLimitSec: 10,
    passScore: 8,
    passStreakRequired: 2,
    section: 'decimals',
  },

  // ── APPLIED MATH
  {
    id: 'AP1',
    label: 'Percentage',
    drillType: 'percentage',
    timeLimitSec: 15,
    passScore: 8,
    passStreakRequired: 2,
    section: 'applied',
  },
  {
    id: 'AP2',
    label: 'Ratio & Proportion',
    drillType: 'ratio',
    timeLimitSec: 15,
    passScore: 8,
    passStreakRequired: 2,
    section: 'applied',
  },
  {
    id: 'AP3',
    label: 'Unitary Method',
    drillType: 'unitary',
    timeLimitSec: 20,
    passScore: 8,
    passStreakRequired: 2,
    section: 'applied',
  },
  {
    id: 'AP4',
    label: 'Average',
    drillType: 'average',
    timeLimitSec: 15,
    passScore: 8,
    passStreakRequired: 2,
    section: 'applied',
  },
  {
    id: 'AP5',
    label: 'Simple Interest',
    drillType: 'simple_interest',
    timeLimitSec: 20,
    passScore: 8,
    passStreakRequired: 2,
    section: 'applied',
  },
  {
    id: 'AP6',
    label: 'Profit and Loss',
    drillType: 'profit_loss',
    timeLimitSec: 20,
    passScore: 8,
    passStreakRequired: 2,
    section: 'applied',
  },
  {
    id: 'AP7',
    label: 'Speed, Distance, Time',
    drillType: 'speed_time',
    timeLimitSec: 20,
    passScore: 8,
    passStreakRequired: 2,
    section: 'applied',
  },
  {
    id: 'AP8',
    label: 'Unit Conversion',
    drillType: 'unit_convert',
    timeLimitSec: 12,
    passScore: 8,
    passStreakRequired: 2,
    section: 'applied',
  },

  // ── GEOMETRY
  {
    id: 'G1',
    label: 'Area & Perimeter',
    drillType: 'area_perimeter',
    timeLimitSec: 20,
    passScore: 8,
    passStreakRequired: 2,
    section: 'geometry',
  },
  {
    id: 'G2',
    label: 'Volume',
    drillType: 'volume',
    timeLimitSec: 20,
    passScore: 8,
    passStreakRequired: 2,
    section: 'geometry',
  },
  {
    id: 'G3',
    label: 'Angles',
    drillType: 'angles',
    timeLimitSec: 15,
    passScore: 8,
    passStreakRequired: 2,
    section: 'geometry',
  },
  {
    id: 'G4',
    label: 'Shapes',
    drillType: 'shapes',
    timeLimitSec: 10,
    passScore: 8,
    passStreakRequired: 2,
    section: 'geometry',
  },

  // ── INTELLIGENCE
  {
    id: 'R1',
    label: 'Number series',
    drillType: 'series_number',
    timeLimitSec: 15,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },
  {
    id: 'R2',
    label: 'Letter series',
    drillType: 'series_letter',
    timeLimitSec: 15,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },
  {
    id: 'R3',
    label: 'Mixed series',
    drillType: 'series_mixed',
    timeLimitSec: 15,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },
  {
    id: 'R4',
    label: 'Math analogies',
    drillType: 'analogy_math',
    timeLimitSec: 15,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },
  {
    id: 'R5',
    label: 'Verbal analogies',
    drillType: 'analogy_verbal',
    timeLimitSec: 20,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },
  {
    id: 'R6',
    label: 'Missing number',
    drillType: 'missing_number',
    timeLimitSec: 20,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },
  {
    id: 'R7',
    label: 'Odd one out',
    drillType: 'odd_one_out',
    timeLimitSec: 15,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },
  {
    id: 'R8',
    label: 'Coding-Decoding',
    drillType: 'coding',
    timeLimitSec: 20,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },
  {
    id: 'R9',
    label: 'Direction & Distance',
    drillType: 'direction',
    timeLimitSec: 20,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },
  {
    id: 'R10',
    label: 'Ranking',
    drillType: 'ranking',
    timeLimitSec: 15,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },
  {
    id: 'R11',
    label: 'Calendar & Clocks',
    drillType: 'calendar',
    timeLimitSec: 20,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },
  {
    id: 'R12',
    label: 'Mirror Images',
    drillType: 'mirror',
    timeLimitSec: 15,
    passScore: 7,
    passStreakRequired: 2,
    section: 'intelligence',
  },

  // ── OLYMPIAD
  {
    id: 'O1',
    label: 'Squares 1–25',
    drillType: 'squares',
    timeLimitSec: 5,
    passScore: 8,
    passStreakRequired: 2,
    section: 'olympiad',
  },
  {
    id: 'O2',
    label: 'Cubes 1–15',
    drillType: 'cubes',
    timeLimitSec: 8,
    passScore: 8,
    passStreakRequired: 2,
    section: 'olympiad',
  },
  {
    id: 'O3',
    label: 'LCM & HCF',
    drillType: 'lhcf',
    timeLimitSec: 20,
    passScore: 8,
    passStreakRequired: 2,
    section: 'olympiad',
  },
  {
    id: 'O4',
    label: 'Unit digit patterns',
    drillType: 'unit_digit',
    timeLimitSec: 10,
    passScore: 8,
    passStreakRequired: 2,
    section: 'olympiad',
  },
];

// ─── Section metadata ─────────────────────────────────────────────────────────
export interface SectionMeta {
  id: Section;
  label: string;
  icon: string;
  color: string;
  colorLight: string;
  unlocksAfter: Section | null; // null = always available
}

export const SECTIONS: SectionMeta[] = [
  {
    id: 'addition',
    label: 'Addition',
    icon: '＋',
    color: '#534AB7',
    colorLight: '#EEEDFE',
    unlocksAfter: null,
  },
  {
    id: 'subtraction',
    label: 'Subtraction',
    icon: '－',
    color: '#0F6E56',
    colorLight: '#E1F5EE',
    unlocksAfter: 'addition',
  },
  {
    id: 'multiplication',
    label: 'Multiplication',
    icon: '×',
    color: '#854F0B',
    colorLight: '#FAEEDA',
    unlocksAfter: 'subtraction',
  },
  {
    id: 'division',
    label: 'Division',
    icon: '÷',
    color: '#993C1D',
    colorLight: '#FAECE7',
    unlocksAfter: 'multiplication',
  },
  {
    id: 'fractions',
    label: 'Fractions',
    icon: '½',
    color: '#3B6D11',
    colorLight: '#EAF3DE',
    unlocksAfter: 'division',
  },
  {
    id: 'decimals',
    label: 'Decimals & BODMAS',
    icon: '.',
    color: '#534AB7',
    colorLight: '#EEEDFE',
    unlocksAfter: 'fractions',
  },
  {
    id: 'applied',
    label: 'Applied Math',
    icon: '📐',
    color: '#0F6E56',
    colorLight: '#E1F5EE',
    unlocksAfter: 'decimals',
  },
  {
    id: 'geometry',
    label: 'Geometry',
    icon: '△',
    color: '#854F0B',
    colorLight: '#FAEEDA',
    unlocksAfter: 'applied',
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    icon: '🧠',
    color: '#993C1D',
    colorLight: '#FAECE7',
    unlocksAfter: null,
  }, // always available
  {
    id: 'olympiad',
    label: 'Olympiad',
    icon: '🏆',
    color: '#3B6D11',
    colorLight: '#EAF3DE',
    unlocksAfter: 'division',
  },
];

// ─── Question types ───────────────────────────────────────────────────────────

// Numeric answer (type-in)
export interface NumericQuestion {
  kind: 'numeric';
  display: string;
  answer: number;
  hint?: string;
  drillType: DrillType;
}

// MCQ answer (4 options) — used for Intelligence, fractions display, geometry
export interface MCQQuestion {
  kind: 'mcq';
  display: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  drillType: DrillType;
}

export type Question = NumericQuestion | MCQQuestion;

// ─── Per-question result ───────────────────────────────────────────────────────
export interface QuestionResult {
  question: string;
  expected: string; // string so works for both numeric and MCQ
  userAnswer: string | null;
  correct: boolean;
  timeSec: number;
  timedOut: boolean;
  drillType: DrillType;
  subLevelId: string;
}

// ─── Session ──────────────────────────────────────────────────────────────────
export interface Session {
  id: string;
  date: string;
  subLevelId: string;
  drillType: DrillType;
  section: Section;
  score: number;
  total: number;
  accuracy: number;
  avgTimeSec: number;
  bestStreakInSession: number;
  timeLimitSec: number;
  questions: QuestionResult[];
  passed: boolean;
}

// ─── Student progress per sub-level ──────────────────────────────────────────
export interface SubLevelProgress {
  subLevelId: string;
  unlocked: boolean;
  completed: boolean;
  consecutivePassCount: number;
  bestAccuracy: number;
  bestTimeSec: number;
  attempts: number;
}

// ─── Student ──────────────────────────────────────────────────────────────────
export interface Student {
  name: string;
  dailyStreak: number;
  lastSessionDate: string | null;
  totalSessions: number;
  totalCorrect: number;
  badges: Badge[];
  subLevelProgress: Record<string, SubLevelProgress>;
  currentSubLevelId: string; // active sub-level being worked on
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  label: string;
  icon: string;
  earnedDate: string;
}

// ─── Weak spots ───────────────────────────────────────────────────────────────
export interface WeakSpot {
  drillType: DrillType;
  subLevelId: string;
  label: string;
  errorCount: number;
  avgTimeSec: number;
}

// ─── Full app state ───────────────────────────────────────────────────────────
export interface AppState {
  student: Student;
  sessions: Session[];
  weakSpots: WeakSpot[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getSubLevel(id: string): SubLevel | undefined {
  return SUB_LEVELS.find((s) => s.id === id);
}

export function getSubLevelsForSection(section: Section): SubLevel[] {
  return SUB_LEVELS.filter((s) => s.section === section);
}

export function getNextSubLevel(currentId: string): SubLevel | undefined {
  const idx = SUB_LEVELS.findIndex((s) => s.id === currentId);
  return idx >= 0 && idx < SUB_LEVELS.length - 1 ? SUB_LEVELS[idx + 1] : undefined;
}

export function isSectionComplete(
  section: Section,
  progress: Record<string, SubLevelProgress>,
): boolean {
  return getSubLevelsForSection(section).every((sl) => progress[sl.id]?.completed ?? false);
}

export function isSectionUnlocked(
  section: Section,
  progress: Record<string, SubLevelProgress>,
): boolean {
  const meta = SECTIONS.find((s) => s.id === section);
  if (!meta) return false;
  if (!meta.unlocksAfter) return true; // always available
  return isSectionComplete(meta.unlocksAfter, progress);
}

export function buildInitialProgress(): Record<string, SubLevelProgress> {
  const result: Record<string, SubLevelProgress> = {};
  SUB_LEVELS.forEach((sl, idx) => {
    // First sub-level of addition and intelligence always unlocked
    const autoUnlock = sl.id === 'A1' || sl.id === 'R1';
    result[sl.id] = {
      subLevelId: sl.id,
      unlocked: autoUnlock,
      completed: false,
      consecutivePassCount: 0,
      bestAccuracy: 0,
      bestTimeSec: 999,
      attempts: 0,
    };
  });
  return result;
}

// Label lookup
export const DRILL_LABELS: Record<DrillType, string> = {
  add_1_1: '1-digit + 1-digit',
  add_2_1: '2-digit + 1-digit',
  add_2_2: '2-digit + 2-digit',
  add_3_2: '3-digit + 2-digit',
  add_3_3: '3-digit + 3-digit',
  sub_1_1: '1-digit − 1-digit',
  sub_2_1: '2-digit − 1-digit',
  sub_2_2: '2-digit − 2-digit',
  sub_3_2: '3-digit − 2-digit',
  sub_3_3: '3-digit − 3-digit',
  mul_1_1: '1×1 digit',
  mul_2_1: '2×1 digit',
  mul_2_2: '2×2 digit',
  mul_3_1: '3×1 digit',
  mul_3_2: '3×2 digit',
  mul_3_3: '3×3 digit',
  div_basic: 'Division facts',
  div_2_1: '2÷1 digit',
  div_3_1: '3÷1 digit',
  div_3_2: '3÷2 digit',
  div_4_2: '4÷2 digit',
  frac_same: 'Fractions (same denom)',
  frac_diff: 'Fractions (diff denom)',
  frac_multiply: 'Multiply fractions',
  frac_divide: 'Divide fractions',
  frac_compare: 'Compare fractions',
  dec_add_sub: 'Decimal add/sub',
  dec_multiply: 'Decimal multiply',
  bodmas: 'BODMAS',
  roman: 'Roman numerals',
  percentage: 'Percentage',
  ratio: 'Ratio & Proportion',
  unitary: 'Unitary Method',
  average: 'Average',
  simple_interest: 'Simple Interest',
  profit_loss: 'Profit & Loss',
  speed_time: 'Speed, Distance, Time',
  unit_convert: 'Unit Conversion',
  area_perimeter: 'Area & Perimeter',
  volume: 'Volume',
  angles: 'Angles',
  shapes: 'Shapes',
  series_number: 'Number Series',
  series_letter: 'Letter Series',
  series_mixed: 'Mixed Series',
  analogy_math: 'Math Analogies',
  analogy_verbal: 'Verbal Analogies',
  missing_number: 'Missing Number',
  odd_one_out: 'Odd One Out',
  coding: 'Coding-Decoding',
  direction: 'Direction & Distance',
  ranking: 'Ranking',
  calendar: 'Calendar & Clocks',
  mirror: 'Mirror Images',
  squares: 'Squares',
  cubes: 'Cubes',
  lhcf: 'LCM & HCF',
  unit_digit: 'Unit Digit',
};


// ─── Auth & Multi-child models ────────────────────────────────────────────────

export const AVATARS = ['🦁','🐯','🐻','🦊','🐼','🐨','🦄','🐸'];

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
  student: Student;
  weakSpots: WeakSpot[];
}

export interface ParentAccount {
  id: 'parent';
  pinHash: string;       // SHA-256 of PIN
  childIds: string[];
  createdAt: number;
}

export interface AuthState {
  role: 'child' | 'parent' | null;
  childId: string | null;
}