import { Injectable } from '@angular/core';
import { Question, DrillType } from './models';

@Injectable({ providedIn: 'root' })
export class DrillEngineService {

  private rnd(a: number, b: number): number {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  generate(drillType: DrillType): Question {
    switch (drillType) {

      // ── Level 1 ─────────────────────────────────────────────────────────────
      case 'add1': {
        const a = this.rnd(1, 9), b = this.rnd(1, 9);
        return { display: `${a} + ${b}`, answer: a + b, drillType };
      }
      case 'sub1': {
        const a = this.rnd(2, 9), b = this.rnd(1, a);
        return { display: `${a} − ${b}`, answer: a - b, drillType };
      }
      case 'mul1': {
        const a = this.rnd(2, 9), b = this.rnd(2, 9);
        return { display: `${a} × ${b}`, answer: a * b, drillType };
      }
      case 'div1': {
        const b = this.rnd(2, 9), ans = this.rnd(2, 9);
        return { display: `${b * ans} ÷ ${b}`, answer: ans, drillType };
      }

      // ── Level 2 ─────────────────────────────────────────────────────────────
      case 'add2': {
        const a = this.rnd(11, 99), b = this.rnd(11, 99);
        return { display: `${a} + ${b}`, answer: a + b, drillType };
      }
      case 'sub2': {
        const a = this.rnd(20, 99), b = this.rnd(10, a - 1);
        return { display: `${a} − ${b}`, answer: a - b, drillType };
      }
      case 'mul21': {
        const a = this.rnd(12, 99), b = this.rnd(2, 9);
        return { display: `${a} × ${b}`, answer: a * b, drillType };
      }
      case 'tables2_12': {
        const a = this.rnd(2, 12), b = this.rnd(2, 12);
        return { display: `${a} × ${b}`, answer: a * b, drillType };
      }

      // ── Level 3 ─────────────────────────────────────────────────────────────
      case 'add3': {
        const a = this.rnd(101, 999), b = this.rnd(101, 999);
        return { display: `${a} + ${b}`, answer: a + b, drillType };
      }
      case 'sub3': {
        const a = this.rnd(200, 999), b = this.rnd(100, a - 1);
        return { display: `${a} − ${b}`, answer: a - b, drillType };
      }
      case 'mul22': {
        const a = this.rnd(12, 59), b = this.rnd(12, 59);
        return { display: `${a} × ${b}`, answer: a * b, drillType };
      }
      case 'tables13_20': {
        const a = this.rnd(13, 20), b = this.rnd(2, 12);
        return { display: `${a} × ${b}`, answer: a * b, drillType };
      }

      // ── Level 4 ─────────────────────────────────────────────────────────────
      case 'mul22_hard': {
        const a = this.rnd(25, 99), b = this.rnd(25, 99);
        return { display: `${a} × ${b}`, answer: a * b, drillType };
      }
      case 'squares': {
        const n = this.rnd(1, 25);
        return { display: `${n}²`, answer: n * n, drillType };
      }
      case 'tables21_25': {
        const a = this.rnd(21, 25), b = this.rnd(2, 12);
        return { display: `${a} × ${b}`, answer: a * b, drillType };
      }

      // ── Level 5 ─────────────────────────────────────────────────────────────
      case 'cubes': {
        const n = this.rnd(1, 15);
        return { display: `${n}³`, answer: n * n * n, drillType };
      }
      case 'pct': {
        const pcts = [5, 10, 20, 25, 50];
        const p = pcts[this.rnd(0, pcts.length - 1)];
        const n = this.rnd(1, 40) * 10;
        return { display: `${p}% of ${n}`, answer: Math.round(p * n / 100), drillType };
      }
      case 'lcm_hcf': {
        const pairs = [[4,6],[6,9],[8,12],[12,15],[15,20],[6,8],[9,12]];
        const [a, b] = pairs[this.rnd(0, pairs.length - 1)];
        const useHcf = this.rnd(0, 1) === 0;
        if (useHcf) {
          const hcf = this.gcd(a, b);
          return { display: `HCF of ${a} and ${b}`, answer: hcf, drillType };
        } else {
          const lcm = (a * b) / this.gcd(a, b);
          return { display: `LCM of ${a} and ${b}`, answer: lcm, drillType };
        }
      }
      case 'unit_digit': {
        const bases = [2, 3, 4, 7, 8, 9];
        const base = bases[this.rnd(0, bases.length - 1)];
        const exp  = this.rnd(2, 8);
        const answer = Math.pow(base, exp) % 10;
        return { display: `Unit digit of ${base}^${exp}`, answer, drillType };
      }

      default: {
        const a = this.rnd(1, 9), b = this.rnd(1, 9);
        return { display: `${a} + ${b}`, answer: a + b, drillType: 'add1' };
      }
    }
  }

  generateSet(drillType: DrillType | 'mixed', level: number, count: number): Question[] {
    const levelDrillMap: Record<number, DrillType[]> = {
      1: ['add1', 'sub1', 'mul1', 'div1'],
      2: ['add2', 'sub2', 'mul21', 'tables2_12'],
      3: ['add3', 'sub3', 'mul22', 'tables13_20'],
      4: ['mul22_hard', 'squares', 'tables21_25'],
      5: ['cubes', 'pct', 'lcm_hcf', 'unit_digit'],
    };

    const types = drillType === 'mixed'
      ? levelDrillMap[level] ?? levelDrillMap[1]
      : [drillType];

    return Array.from({ length: count }, () => {
      const t = types[this.rnd(0, types.length - 1)];
      return this.generate(t);
    });
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}