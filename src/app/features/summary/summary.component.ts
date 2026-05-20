import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session, Student, LEVELS } from '../../core/models';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit {
  session = signal<Session | null>(null);
  student = signal<Student | null>(null);
  leveledUp = signal(false);

  constructor(private router: Router) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation()?.extras.state as any;
    if (!nav?.session) { this.router.navigate(['/home']); return; }
    this.session.set(nav.session);
    this.student.set(nav.student);
    this.leveledUp.set(nav.student?.badges?.some(
      (b: any) => b.earnedDate === new Date().toISOString().split('T')[0] && b.id.startsWith('level_')
    ) ?? false);
  }

  get passed()     { return (this.session()?.score ?? 0) >= 8; }
  get levelDef()   { return LEVELS.find(l => l.level === this.student()?.currentLevel); }
  get accuracyColor() {
    const a = this.session()?.accuracy ?? 0;
    return a >= 80 ? 'var(--green)' : a >= 60 ? 'var(--amber)' : 'var(--coral)';
  }

  goHome()      { this.router.navigate(['/home']); }
  tryAgain()    { this.router.navigate(['/drill'], { queryParams: { type: this.session()?.drillType, level: this.session()?.level } }); }
  goProgress()  { this.router.navigate(['/progress']); }
}