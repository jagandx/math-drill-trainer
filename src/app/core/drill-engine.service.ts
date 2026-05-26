import { Injectable } from '@angular/core';
import { Question, NumericQuestion, MCQQuestion, DrillType } from './models';

@Injectable({ providedIn: 'root' })
export class DrillEngineService {

  private rnd(a: number, b: number): number {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  private pick<T>(arr: T[]): T {
    return arr[this.rnd(0, arr.length - 1)];
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private numeric(display: string, answer: number, drillType: DrillType, hint?: string): NumericQuestion {
    return { kind: 'numeric', display, answer, drillType, hint };
  }

  private mcq(display: string, options: string[], correctIndex: number, drillType: DrillType, explanation?: string): MCQQuestion {
    return { kind: 'mcq', display, options, correctIndex, drillType, explanation };
  }

  // Generate wrong MCQ options that are plausible but not correct
  private wrongOptions(correct: number, count: number, spread = 3): number[] {
    const wrongs = new Set<number>();
    let attempts = 0;
    while (wrongs.size < count && attempts < 50) {
      const delta = this.rnd(1, spread) * (Math.random() < 0.5 ? 1 : -1);
      const w = correct + delta;
      if (w !== correct && w >= 0) wrongs.add(w);
      attempts++;
    }
    return Array.from(wrongs).slice(0, count);
  }

  private mcqFromNumber(display: string, answer: number, drillType: DrillType, spread = 3): MCQQuestion {
    const wrongs = this.wrongOptions(answer, 3, spread);
    const allOptions = this.shuffle([answer, ...wrongs]);
    const correctIndex = allOptions.indexOf(answer);
    return this.mcq(display, allOptions.map(String), correctIndex, drillType);
  }

  generate(drillType: DrillType): Question {
    switch (drillType) {

      // ── ADDITION ───────────────────────────────────────────────────────────
      case 'add_1_1': {
        const a = this.rnd(1,9), b = this.rnd(1,9);
        return this.numeric(`${a} + ${b}`, a+b, drillType);
      }
      case 'add_2_1': {
        const a = this.rnd(10,99), b = this.rnd(1,9);
        return this.numeric(`${a} + ${b}`, a+b, drillType);
      }
      case 'add_2_2': {
        const a = this.rnd(10,99), b = this.rnd(10,99);
        return this.numeric(`${a} + ${b}`, a+b, drillType);
      }
      case 'add_3_2': {
        const a = this.rnd(100,999), b = this.rnd(10,99);
        return this.numeric(`${a} + ${b}`, a+b, drillType);
      }
      case 'add_3_3': {
        const a = this.rnd(100,999), b = this.rnd(100,999);
        return this.numeric(`${a} + ${b}`, a+b, drillType);
      }

      // ── SUBTRACTION ────────────────────────────────────────────────────────
      case 'sub_1_1': {
        const b = this.rnd(1,9), a = this.rnd(b,9);
        return this.numeric(`${a} − ${b}`, a-b, drillType);
      }
      case 'sub_2_1': {
        const b = this.rnd(1,9), a = this.rnd(10,99);
        return this.numeric(`${a} − ${b}`, a-b, drillType);
      }
      case 'sub_2_2': {
        const b = this.rnd(10,89), a = this.rnd(b+1,99);
        return this.numeric(`${a} − ${b}`, a-b, drillType);
      }
      case 'sub_3_2': {
        const b = this.rnd(10,99), a = this.rnd(100,999);
        return this.numeric(`${a} − ${b}`, a-b, drillType);
      }
      case 'sub_3_3': {
        const b = this.rnd(100,899), a = this.rnd(b+1,999);
        return this.numeric(`${a} − ${b}`, a-b, drillType);
      }

      // ── MULTIPLICATION ─────────────────────────────────────────────────────
      case 'mul_1_1': {
        const a = this.rnd(2,9), b = this.rnd(2,9);
        return this.numeric(`${a} × ${b}`, a*b, drillType);
      }
      case 'mul_2_1': {
        const a = this.rnd(10,99), b = this.rnd(2,9);
        return this.numeric(`${a} × ${b}`, a*b, drillType);
      }
      case 'mul_2_2': {
        const a = this.rnd(10,99), b = this.rnd(10,99);
        return this.numeric(`${a} × ${b}`, a*b, drillType, 'Split method: (tens×b) + (units×b)');
      }
      case 'mul_3_1': {
        const a = this.rnd(100,999), b = this.rnd(2,9);
        return this.numeric(`${a} × ${b}`, a*b, drillType);
      }
      case 'mul_3_2': {
        const a = this.rnd(100,499), b = this.rnd(10,49);
        return this.numeric(`${a} × ${b}`, a*b, drillType);
      }
      case 'mul_3_3': {
        const a = this.rnd(100,299), b = this.rnd(100,299);
        return this.numeric(`${a} × ${b}`, a*b, drillType);
      }

      // ── DIVISION ───────────────────────────────────────────────────────────
      case 'div_basic': {
        const b = this.rnd(2,9), q = this.rnd(2,9);
        return this.numeric(`${b*q} ÷ ${b}`, q, drillType);
      }
      case 'div_2_1': {
        const b = this.rnd(2,9), q = this.rnd(2,9);
        const a = b * q;  // guaranteed clean division
        return this.numeric(`${a} ÷ ${b}`, q, drillType);
      }
      case 'div_3_1': {
        const b = this.rnd(2,9), q = this.rnd(10,99);
        return this.numeric(`${b*q} ÷ ${b}`, q, drillType);
      }
      case 'div_3_2': {
        const divisors = [11,12,13,14,15,16,17,18,19,20,22,24,25];
        const b = this.pick(divisors), q = this.rnd(5,40);
        return this.numeric(`${b*q} ÷ ${b}`, q, drillType);
      }
      case 'div_4_2': {
        const divisors = [12,15,16,18,20,24,25];
        const b = this.pick(divisors), q = this.rnd(20,80);
        return this.numeric(`${b*q} ÷ ${b}`, q, drillType);
      }

      // ── FRACTIONS ──────────────────────────────────────────────────────────
      case 'frac_same': {
        const d = this.pick([4,5,6,8,10,12]);
        const a = this.rnd(1, d-1), b = this.rnd(1, d-1);
        const ops = ['+', '−'];
        const op = this.pick(ops);
        if (op === '+') {
          const num = a + b;
          // simplify
          const g = this.gcd(num, d);
          const display = `${a}/${d} + ${b}/${d}`;
          return this.mcqFromNumber(display, num/g, drillType, 2);
        } else {
          const bigger = Math.max(a,b), smaller = Math.min(a,b);
          const num = bigger - smaller;
          const g = this.gcd(Math.max(num,1), d);
          return this.mcqFromNumber(`${bigger}/${d} − ${smaller}/${d}`, num/g, drillType, 2);
        }
      }
      case 'frac_diff': {
        const denoms: [number,number][] = [[2,4],[2,3],[3,4],[4,6],[3,6],[2,6]];
        const [d1, d2] = this.pick(denoms);
        const a = this.rnd(1, d1-1), b = this.rnd(1, d2-1);
        const lcd = (d1 * d2) / this.gcd(d1, d2);
        const num = (a * (lcd/d1)) + (b * (lcd/d2));
        const g = this.gcd(num, lcd);
        return this.mcqFromNumber(`${a}/${d1} + ${b}/${d2}`, num/g, drillType, 2);
      }
      case 'frac_multiply': {
        const a1 = this.rnd(1,4), a2 = this.rnd(2,6);
        const b1 = this.rnd(1,4), b2 = this.rnd(2,6);
        const num = a1*b1, den = a2*b2;
        const g = this.gcd(num, den);
        return this.mcqFromNumber(`${a1}/${a2} × ${b1}/${b2}`, num/g, drillType, 2);
      }
      case 'frac_divide': {
        const a1 = this.rnd(1,4), a2 = this.rnd(2,6);
        const b1 = this.rnd(1,4), b2 = this.rnd(2,6);
        const num = a1*b2, den = a2*b1;
        const g = this.gcd(num, den);
        return this.mcqFromNumber(`${a1}/${a2} ÷ ${b1}/${b2}`, num/g, drillType, 2);
      }
      case 'frac_compare': {
        const pairs: [number,number,number,number][] = [
          [1,2,1,3],[2,3,3,4],[1,4,1,3],[3,8,1,2],[2,5,3,7]
        ];
        const [a,b,c,d] = this.pick(pairs);
        const frac1 = a/b, frac2 = c/d;
        const bigger = frac1 > frac2 ? `${a}/${b}` : `${c}/${d}`;
        const options = [`${a}/${b}`, `${c}/${d}`, 'Equal', 'Cannot compare'];
        const correctIndex = frac1 > frac2 ? 0 : frac2 > frac1 ? 1 : 2;
        return this.mcq(`Which is greater: ${a}/${b} or ${c}/${d}?`, options, correctIndex, drillType);
      }

      // ── DECIMALS & BODMAS ──────────────────────────────────────────────────
      case 'dec_add_sub': {
        const a = this.rnd(1,50) + this.rnd(0,9)/10;
        const b = this.rnd(1,20) + this.rnd(0,9)/10;
        const op = this.pick(['+','−']);
        const ans = op === '+' ? parseFloat((a+b).toFixed(1)) : parseFloat((a-b).toFixed(1));
        return this.numeric(`${a.toFixed(1)} ${op} ${b.toFixed(1)}`, ans, drillType);
      }
      case 'dec_multiply': {
        const a = this.rnd(1,9) + this.rnd(1,9)/10;
        const b = this.rnd(2,5);
        return this.numeric(`${a.toFixed(1)} × ${b}`, parseFloat((a*b).toFixed(1)), drillType);
      }
      case 'bodmas': {
        const templates = [
          () => { const [a,b,c] = [this.rnd(2,8),this.rnd(2,8),this.rnd(1,5)]; return { q:`${a} + ${b} × ${c}`, a: a+(b*c) }; },
          () => { const [a,b,c] = [this.rnd(5,20),this.rnd(2,8),this.rnd(1,4)]; return { q:`(${a} + ${b}) × ${c}`, a:(a+b)*c }; },
          () => { const [a,b,c] = [this.rnd(10,30),this.rnd(2,8),this.rnd(1,5)]; return { q:`${a} − ${b} × ${c}`, a:a-(b*c) }; },
          () => { const [a,b,c,d] = [this.rnd(2,6),this.rnd(2,6),this.rnd(2,5),this.rnd(1,4)]; return { q:`${a} × ${b} + ${c} × ${d}`, a:a*b+c*d }; },
        ];
        const t = this.pick(templates)();
        return this.numeric(t.q, t.a, drillType, 'Remember BODMAS order');
      }
      case 'roman': {
        const nums = [4,6,9,11,14,19,24,29,34,39,40,49,50,
                      59,60,69,79,89,90,99,100,400,500,900,1000];
        const romanMap: [number,string][] = [
          [1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],
          [100,'C'],[90,'XC'],[50,'L'],[40,'XL'],
          [10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']
        ];
        const toRoman = (n: number) => {
          let result = '';
          for (const [val, sym] of romanMap) { while(n>=val){result+=sym;n-=val;} }
          return result;
        };
        const n = this.pick(nums);
        const roman = toRoman(n);
        const useDir = this.rnd(0,1);
        if (useDir === 0) {
          // Roman → number
          const wrongs = this.wrongOptions(n, 3, Math.round(n * 0.15) || 5);
          const opts = this.shuffle([n, ...wrongs]);
          return this.mcq(`${roman} = ?`, opts.map(String), opts.indexOf(n), drillType);
        } else {
          // Number → Roman
          const wrongNums = this.wrongOptions(n, 3, Math.round(n*0.1)||3);
          const opts = this.shuffle([roman, ...wrongNums.map(toRoman)]);
          return this.mcq(`${n} in Roman numerals?`, opts, opts.indexOf(roman), drillType);
        }
      }

      // ── APPLIED MATH ───────────────────────────────────────────────────────
      case 'percentage': {
        const pcts = [5,10,15,20,25,50,75];
        const p = this.pick(pcts);
        const n = this.rnd(2,20) * 10;
        const ans = Math.round(p * n / 100);
        return this.numeric(`${p}% of ${n} = ?`, ans, drillType);
      }
      case 'ratio': {
        const templates = [
          () => { const a=this.rnd(1,6),b=this.rnd(1,6),k=this.rnd(2,5); return { q:`Simplify ${a*k} : ${b*k}`, a:a, note:`= ${a}:${b}` }; },
          () => { const a=this.rnd(1,6),b=this.rnd(1,6),k=this.rnd(2,5); return { q:`${a} : ${b} = ? : ${b*k}`, a:a*k, note:'' }; },
        ];
        const t = this.pick(templates)();
        return this.mcqFromNumber(t.q, t.a, drillType, 3);
      }
      case 'unitary': {
        const cost = this.rnd(2,20), qty1 = this.rnd(2,8), qty2 = this.rnd(2,8);
        return this.numeric(
          `If ${qty1} items cost ₹${cost*qty1}, find cost of ${qty2} items`,
          cost * qty2, drillType
        );
      }
      case 'average': {
        const count = this.rnd(3,5);
        const nums = Array.from({length:count}, () => this.rnd(10,90));
        const sum = nums.reduce((a,b)=>a+b,0);
        const avg = Math.round(sum / count);
        return this.numeric(`Average of ${nums.join(', ')} = ?`, avg, drillType);
      }
      case 'simple_interest': {
        const P = this.rnd(1,20) * 100;
        const R = this.pick([5,8,10,12,15]);
        const T = this.rnd(1,4);
        const SI = (P * R * T) / 100;
        return this.numeric(`SI: P=₹${P}, R=${R}%, T=${T}yr → SI=?`, SI, drillType, 'SI = P×R×T÷100');
      }
      case 'profit_loss': {
        const cp = this.rnd(50,500);
        const pct = this.pick([5,10,15,20,25]);
        const isProfit = this.rnd(0,1) === 0;
        if (isProfit) {
          const sp = cp + Math.round(cp * pct / 100);
          return this.numeric(`CP=₹${cp}, Profit=${pct}% → SP=?`, sp, drillType);
        } else {
          const sp = cp - Math.round(cp * pct / 100);
          return this.numeric(`CP=₹${cp}, Loss=${pct}% → SP=?`, sp, drillType);
        }
      }
      case 'speed_time': {
        const templates = [
          () => { const s=this.rnd(20,80),t=this.rnd(2,6); return this.numeric(`Speed=${s}km/h, Time=${t}h → Distance?`, s*t, drillType, 'D=S×T'); },
          () => { const d=this.rnd(20,80)*2,t=this.rnd(2,5); return this.numeric(`Distance=${d}km, Time=${t}h → Speed?`, d/t, drillType, 'S=D÷T'); },
          () => { const d=this.rnd(10,50)*4,s=this.rnd(2,8)*4; return this.numeric(`Distance=${d}km, Speed=${s}km/h → Time?`, d/s, drillType, 'T=D÷S'); },
        ];
        return this.pick(templates)();
      }
      case 'unit_convert': {
        const templates = [
          () => { const n=this.rnd(1,10); return this.numeric(`${n} km = ? m`, n*1000, drillType); },
          () => { const n=this.rnd(1,9)*1000; return this.numeric(`${n} m = ? km`, n/1000, drillType); },
          () => { const n=this.rnd(1,10); return this.numeric(`${n} kg = ? g`, n*1000, drillType); },
          () => { const n=this.rnd(1,9)*100; return this.numeric(`${n} cm = ? m`, n/100, drillType); },
          () => { const n=this.rnd(1,5)*100; return this.numeric(`${n} paise = ? rupees`, n/100, drillType); },
        ];
        return this.pick(templates)();
      }

      // ── GEOMETRY ───────────────────────────────────────────────────────────
      case 'area_perimeter': {
        const templates = [
          () => { const l=this.rnd(3,15),w=this.rnd(2,10); return this.mcqFromNumber(`Area of rectangle: l=${l}cm, w=${w}cm`, l*w, drillType, 5); },
          () => { const s=this.rnd(3,15); return this.mcqFromNumber(`Area of square: side=${s}cm`, s*s, drillType, 5); },
          () => { const l=this.rnd(3,15),w=this.rnd(2,10); return this.mcqFromNumber(`Perimeter of rectangle: l=${l}cm, w=${w}cm`, 2*(l+w), drillType, 4); },
          () => { const s=this.rnd(3,15); return this.mcqFromNumber(`Perimeter of square: side=${s}cm`, 4*s, drillType, 4); },
          () => { const b=this.rnd(4,16),h=this.rnd(3,12); return this.mcqFromNumber(`Area of triangle: base=${b}cm, h=${h}cm`, (b*h)/2, drillType, 4); },
        ];
        return this.pick(templates)();
      }
      case 'volume': {
        const templates = [
          () => { const s=this.rnd(2,8); return this.mcqFromNumber(`Volume of cube: side=${s}cm`, s*s*s, drillType, 10); },
          () => { const l=this.rnd(3,10),b=this.rnd(2,8),h=this.rnd(2,6); return this.mcqFromNumber(`Volume of cuboid: ${l}×${b}×${h}cm`, l*b*h, drillType, 10); },
        ];
        return this.pick(templates)();
      }
      case 'angles': {
        const templates = [
          () => { const a=this.rnd(10,80); return this.mcqFromNumber(`Complement of ${a}°`, 90-a, drillType, 5); },
          () => { const a=this.rnd(10,170); return this.mcqFromNumber(`Supplement of ${a}°`, 180-a, drillType, 5); },
          () => { const a=this.rnd(10,80); const b=90-a; return this.mcq(`Are ${a}° and ${b}° complementary or supplementary?`, ['Complementary','Supplementary','Neither','Both'], 0, drillType); },
          () => { const a=this.rnd(10,170); const b=180-a; return this.mcq(`Are ${a}° and ${b}° complementary or supplementary?`, ['Complementary','Supplementary','Neither','Both'], 1, drillType); },
        ];
        return this.pick(templates)();
      }
      case 'shapes': {
        const q = this.pick([
          { q:'How many sides does a hexagon have?', opts:['5','6','7','8'], ci:1 },
          { q:'How many faces does a cube have?', opts:['4','6','8','12'], ci:1 },
          { q:'How many vertices does a cuboid have?', opts:['6','8','10','12'], ci:1 },
          { q:'A triangle has how many sides?', opts:['2','3','4','5'], ci:1 },
          { q:'How many edges does a cube have?', opts:['8','10','12','14'], ci:2 },
          { q:'A pentagon has how many diagonals?', opts:['3','5','6','7'], ci:1 },
          { q:'How many faces does a cylinder have?', opts:['1','2','3','4'], ci:2 },
        ]);
        return this.mcq(q.q, q.opts, q.ci, drillType);
      }

      // ── INTELLIGENCE ───────────────────────────────────────────────────────
      case 'series_number': {
        const seriesTypes = [
          // arithmetic
          () => { const s=this.rnd(1,10),d=this.rnd(2,8); const seq=[s,s+d,s+2*d,s+3*d]; return { q:`${seq.join(', ')}, ?`, a:s+4*d, spread:d }; },
          // geometric
          () => { const s=this.rnd(1,4),r=this.rnd(2,4); const seq=[s,s*r,s*r*r,s*r*r*r]; return { q:`${seq.join(', ')}, ?`, a:s*r*r*r*r, spread:s*r*r }; },
          // squares
          () => { const seq=[1,4,9,16]; return { q:`${seq.join(', ')}, ?`, a:25, spread:4 }; },
          // cubes
          () => { const seq=[1,8,27,64]; return { q:`${seq.join(', ')}, ?`, a:125, spread:30 }; },
          // alternating add
          () => { const s=this.rnd(2,10),a=this.rnd(2,5),b=this.rnd(1,3); const seq=[s,s+a,s+a+b,s+a+b+a]; return { q:`${seq.join(', ')}, ?`, a:s+a+b+a+b, spread:a }; },
          // subtract
          () => { const s=this.rnd(30,80),d=this.rnd(3,10); const seq=[s,s-d,s-2*d,s-3*d]; return { q:`${seq.join(', ')}, ?`, a:s-4*d, spread:d }; },
        ];
        const t = this.pick(seriesTypes)();
        const wrongs = this.wrongOptions(t.a, 3, t.spread || 5);
        const opts = this.shuffle([t.a, ...wrongs]);
        return this.mcq(`Find next: ${t.q}`, opts.map(String), opts.indexOf(t.a), drillType);
      }
      case 'series_letter': {
        const series = [
          { q:'A, C, E, G, ?',      a:'I',  opts:['H','I','J','K'] },
          { q:'B, D, F, H, ?',      a:'J',  opts:['I','J','K','L'] },
          { q:'Z, X, V, T, ?',      a:'R',  opts:['Q','R','S','P'] },
          { q:'A, E, I, M, ?',      a:'Q',  opts:['O','P','Q','R'] },
          { q:'C, F, I, L, ?',      a:'O',  opts:['M','N','O','P'] },
          { q:'A, B, D, G, K, ?',   a:'P',  opts:['N','O','P','Q'] },
          { q:'AB, CD, EF, GH, ?',  a:'IJ', opts:['HI','IJ','JK','KL'] },
          { q:'AZ, BY, CX, DW, ?',  a:'EV', opts:['EU','EV','EW','FV'] },
          { q:'AC, CE, EG, GI, ?',  a:'IK', opts:['HJ','IJ','IK','JK'] },
        ];
        const s = this.pick(series);
        return this.mcq(`Find next: ${s.q}`, s.opts, s.opts.indexOf(s.a), drillType);
      }
      case 'series_mixed': {
        const series = [
          { q:'A1, B2, C3, D4, ?',    a:'E5',  opts:['D5','E4','E5','F5'] },
          { q:'A2, B4, C6, D8, ?',    a:'E10', opts:['E8','E9','E10','F10'] },
          { q:'2A, 4B, 6C, 8D, ?',    a:'10E', opts:['9E','10D','10E','12E'] },
          { q:'Z1, Y2, X3, W4, ?',    a:'V5',  opts:['U5','V4','V5','W5'] },
          { q:'A1, C3, E5, G7, ?',    a:'I9',  opts:['H8','H9','I8','I9'] },
          { q:'1A, 4D, 9I, 16P, ?',   a:'25Y', opts:['20T','25W','25X','25Y'] },
        ];
        const s = this.pick(series);
        return this.mcq(`Find next: ${s.q}`, s.opts, s.opts.indexOf(s.a), drillType);
      }
      case 'analogy_math': {
        const pairs = [
          { q:'2 : 4 :: 3 : ?',     a:'6',  opts:['5','6','8','9'] },
          { q:'4 : 16 :: 5 : ?',    a:'25', opts:['20','24','25','30'] },
          { q:'3 : 27 :: 4 : ?',    a:'64', opts:['48','56','64','81'] },
          { q:'7 : 49 :: 9 : ?',    a:'81', opts:['72','81','90','99'] },
          { q:'10 : 100 :: 11 : ?', a:'121',opts:['110','119','121','131'] },
          { q:'2 : 8 :: 3 : ?',     a:'27', opts:['18','24','27','36'] },
          { q:'5 : 30 :: 6 : ?',    a:'42', opts:['36','42','48','54'] },
        ];
        const p = this.pick(pairs);
        return this.mcq(`${p.q}`, p.opts, p.opts.indexOf(p.a), drillType);
      }
      case 'analogy_verbal': {
        const pairs = [
          { q:'Dog : Bark :: Cat : ?',      a:'Meow',    opts:['Roar','Meow','Hiss','Growl'] },
          { q:'Fish : Water :: Bird : ?',   a:'Sky',     opts:['Land','Tree','Sky','Nest'] },
          { q:'Doctor : Hospital :: Teacher : ?', a:'School', opts:['Office','School','College','Library'] },
          { q:'Book : Read :: Music : ?',   a:'Listen',  opts:['Watch','Listen','Sing','Write'] },
          { q:'Pen : Write :: Knife : ?',   a:'Cut',     opts:['Cut','Draw','Paint','Stab'] },
          { q:'Eye : See :: Ear : ?',       a:'Hear',    opts:['Smell','Taste','Hear','Touch'] },
          { q:'Sun : Day :: Moon : ?',      a:'Night',   opts:['Dark','Evening','Night','Dusk'] },
          { q:'Crow : Black :: Swan : ?',   a:'White',   opts:['Grey','White','Yellow','Blue'] },
          { q:'Milk : White :: Coal : ?',   a:'Black',   opts:['Brown','Grey','Dark','Black'] },
          { q:'India : Rupee :: USA : ?',   a:'Dollar',  opts:['Pound','Euro','Dollar','Franc'] },
        ];
        const p = this.pick(pairs);
        return this.mcq(`${p.q}`, p.opts, p.opts.indexOf(p.a), drillType);
      }
      case 'missing_number': {
        const grids = [
          { q:'[ 2, 4, 8 ]\n[ 3, 6, 12 ]\n[ 4, 8, ? ]',  a:16, opts:['14','15','16','18'] },
          { q:'[ 1, 2, 3 ]\n[ 4, 5, 6 ]\n[ 7, ?, 9 ]',   a:8,  opts:['6','7','8','10'] },
          { q:'[ 3, 6, 9 ]\n[ 4, 8, 12 ]\n[ 5, 10, ? ]', a:15, opts:['13','14','15','20'] },
          { q:'[ 2, 3, 5 ]\n[ 3, 5, 8 ]\n[ 5, 8, ? ]',   a:13, opts:['11','12','13','16'] },
          { q:'[ 4, 9, 16 ]\n[ 25, 36, 49 ]\n[ 64, ?, 100 ]', a:81, opts:['72','81','90','96'] },
          { q:'[ 1, 4, 9 ]\n[ 16, 25, 36 ]\n[ 49, 64, ? ]',   a:81, opts:['72','80','81','90'] },
        ];
        const g = this.pick(grids);
        return this.mcq(`Find the missing number:\n${g.q}`, g.opts, g.opts.indexOf(String(g.a)), drillType);
      }
      case 'odd_one_out': {
        const sets = [
          { q:'2, 3, 5, 9, 11',       a:'9',    opts:['2','3','9','11'],    exp:'9 is not prime' },
          { q:'Square, Circle, Rectangle, Triangle, Cube', a:'Cube', opts:['Square','Circle','Cube','Triangle'], exp:'Cube is 3D' },
          { q:'January, March, June, August, October', a:'June',  opts:['January','March','June','October'], exp:'June has 30 days; others 31' },
          { q:'4, 8, 12, 18, 20',      a:'18',   opts:['8','12','18','20'],  exp:'18 is not divisible by 4' },
          { q:'Rose, Lily, Tulip, Mango, Jasmine', a:'Mango', opts:['Rose','Lily','Mango','Jasmine'], exp:'Mango is a fruit' },
          { q:'1, 4, 9, 16, 20',       a:'20',   opts:['4','9','16','20'],   exp:'20 is not a perfect square' },
          { q:'Dog, Cat, Cow, Parrot, Horse', a:'Parrot', opts:['Cat','Cow','Parrot','Horse'], exp:'Parrot is a bird' },
          { q:'Metre, Kilogram, Litre, Celsius, Second', a:'Celsius', opts:['Metre','Kilogram','Celsius','Second'], exp:'Celsius is temperature, others are SI units' },
        ];
        const s = this.pick(sets);
        return this.mcq(`Odd one out: ${s.q}`, s.opts, s.opts.indexOf(s.a), drillType, s.exp);
      }
      case 'coding': {
        const schemes = [
          { q:'If A=1, B=2, ..., Z=26, then CAB = ?',          a:'312', opts:['123','312','321','213'] },
          { q:'If A=1, B=2, ..., Z=26, then ACE = ?',          a:'135', opts:['135','153','315','531'] },
          { q:'If BOOK is coded as CPPL, then GOOD = ?',        a:'HPPE',opts:['GPOD','HPPE','IQPF','HQPE'] },
          { q:'If CAT = 3+1+20 = 24, then DOG = ?',            a:'26',  opts:['22','24','26','28'] },
          { q:'If FISH is coded as GJTJ, then BIRD = ?',        a:'CJSE',opts:['BJSE','CJSE','BJRD','CJRD'] },
          { q:'If MAN = 28, then WOMAN = ?',                    a:'57',  opts:['50','55','57','60'] },
        ];
        const c = this.pick(schemes);
        return this.mcq(c.q, c.opts, c.opts.indexOf(c.a), drillType);
      }
      case 'direction': {
        const problems = [
          { q:'Raju walks 5km North, then 3km East. How far is he from start?', a:'√34 km', opts:['4km','5km','8km','√34 km'] },
          { q:'Facing North, turn Right. Now facing?',          a:'East',  opts:['North','East','South','West'] },
          { q:'Facing South, turn Left. Now facing?',           a:'East',  opts:['North','East','South','West'] },
          { q:'Anita walks 4km East, then 3km North. Distance from start?', a:'5km', opts:['4km','5km','7km','8km'] },
          { q:'Sun rises in which direction?',                  a:'East',  opts:['North','East','South','West'] },
          { q:'Facing East, turn 180°. Now facing?',            a:'West',  opts:['North','East','South','West'] },
          { q:'Ram goes 3km North, 4km West. How far from start?', a:'5km', opts:['5km','6km','7km','8km'] },
        ];
        const p = this.pick(problems);
        return this.mcq(p.q, p.opts, p.opts.indexOf(p.a), drillType);
      }
      case 'ranking': {
        const problems = [
          { q:'Riya is 5th from left and 6th from right. Total students?',  a:'10', opts:['9','10','11','12'] },
          { q:'Arjun is 8th from top and 7th from bottom. Total students?', a:'14', opts:['13','14','15','16'] },
          { q:'Sam is 4th from left and 5th from right. Total?',            a:'8',  opts:['7','8','9','10'] },
          { q:'Priya is 6th from front and 4th from back. Total?',          a:'9',  opts:['8','9','10','11'] },
          { q:'If 10 students and Raj is 4th from left, position from right?', a:'7th', opts:['5th','6th','7th','8th'] },
        ];
        const p = this.pick(problems);
        return this.mcq(p.q, p.opts, p.opts.indexOf(p.a), drillType);
      }
      case 'calendar': {
        const problems = [
          { q:'How many days in a leap year?',               a:'366', opts:['364','365','366','367'] },
          { q:'How many weeks in a year (approx)?',          a:'52',  opts:['48','50','52','54'] },
          { q:'If 1st Jan is Monday, what day is 8th Jan?',  a:'Monday', opts:['Sunday','Monday','Tuesday','Wednesday'] },
          { q:'If 15th Aug is Wednesday, what day is 22nd Aug?', a:'Wednesday', opts:['Monday','Tuesday','Wednesday','Thursday'] },
          { q:'How many months have 31 days?',               a:'7',   opts:['6','7','8','9'] },
          { q:'Feb in a leap year has how many days?',       a:'29',  opts:['28','29','30','31'] },
          { q:'How many days in the month of April?',        a:'30',  opts:['28','29','30','31'] },
          { q:'A clock shows 3:00. Angle between hands?',    a:'90°', opts:['45°','60°','90°','120°'] },
          { q:'A clock shows 6:00. Angle between hands?',    a:'180°',opts:['90°','120°','180°','360°'] },
        ];
        const p = this.pick(problems);
        return this.mcq(p.q, p.opts, p.opts.indexOf(p.a), drillType);
      }
      case 'mirror': {
        const problems = [
          { q:'Mirror image of "b" is?',      a:'d',  opts:['d','p','q','b'] },
          { q:'Mirror image of "p" is?',      a:'q',  opts:['b','d','p','q'] },
          { q:'Mirror image of "d" is?',      a:'b',  opts:['b','d','p','q'] },
          { q:'Mirror image of "3" is?',      a:'ε',  opts:['ε','E','3','m'] },
          { q:'Water image of "A" is?',       a:'∀',  opts:['A','∀','Λ','V'] },
          { q:'Mirror placed on right: "CAT" becomes?', a:'TAC', opts:['CAT','TAC','ACT','CTA'] },
          { q:'If you see "AMBULANCE" in rear mirror, it reads?', a:'AMBULANCE', opts:['ECNALUBMA','AMBULANCE','ECNALUБMA','AMBULANCE'] },
        ];
        const p = this.pick(problems);
        return this.mcq(p.q, p.opts, p.opts.indexOf(p.a), drillType);
      }

      // ── OLYMPIAD ───────────────────────────────────────────────────────────
      case 'squares': {
        const n = this.rnd(1, 25);
        return this.numeric(`${n}² = ?`, n*n, drillType);
      }
      case 'cubes': {
        const n = this.rnd(1, 15);
        return this.numeric(`${n}³ = ?`, n*n*n, drillType);
      }
      case 'lhcf': {
        const pairs: [number,number][] = [[4,6],[6,9],[8,12],[12,15],[15,20],[18,24],[16,24]];
        const [a,b] = this.pick(pairs);
        const useHcf = this.rnd(0,1) === 0;
        if (useHcf) {
          return this.numeric(`HCF of ${a} and ${b}?`, this.gcd(a,b), drillType);
        } else {
          const lcm = (a*b) / this.gcd(a,b);
          return this.numeric(`LCM of ${a} and ${b}?`, lcm, drillType);
        }
      }
      case 'unit_digit': {
        const bases = [2,3,4,7,8,9];
        const base = this.pick(bases);
        const exp  = this.rnd(2,8);
        const ans  = Math.pow(base, exp) % 10;
        return this.mcqFromNumber(`Unit digit of ${base}^${exp}`, ans, drillType, 3);
      }

      default: {
        const a = this.rnd(1,9), b = this.rnd(1,9);
        return this.numeric(`${a} + ${b}`, a+b, 'add_1_1');
      }
    }
  }

  generateSet(drillType: DrillType, count: number): Question[] {
    return Array.from({ length: count }, () => this.generate(drillType));
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}