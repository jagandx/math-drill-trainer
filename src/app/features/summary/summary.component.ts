import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session, Student, getSubLevel, SECTIONS } from '../../core/models';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit {
  session   = signal<Session | null>(null);
  student   = signal<Student | null>(null);
  leveledUp = signal(false);
  newBadge  = signal<string | null>(null);

  constructor(private router: Router) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation()?.extras.state as any;
    if (!nav?.session) { this.router.navigate(['/home']); return; }
    this.session.set(nav.session);
    this.student.set(nav.student);

    // Check if sub-level was just completed
    const slId  = nav.session.subLevelId;
    const today = new Date().toISOString().split('T')[0];
    const completeBadge = nav.student?.badges?.find(
      (b: any) => b.id === `complete_${slId}` && b.earnedDate === today
    );
    this.leveledUp.set(!!completeBadge);
    this.newBadge.set(completeBadge?.label ?? null);
  }

  get passed()        { return this.session()?.passed ?? false; }
  get subLevelDef()   { return getSubLevel(this.session()?.subLevelId ?? 'A1'); }
  get sectionMeta()   { return SECTIONS.find(s => s.id === this.subLevelDef?.section); }

  get subLevelProgress() {
    const id = this.session()?.subLevelId ?? 'A1';
    return this.student()?.subLevelProgress?.[id];
  }

  get passStreak()   { return this.subLevelProgress?.consecutivePassCount ?? 0; }
  get passRequired() { return this.subLevelDef?.passStreakRequired ?? 2; }

  get accuracyColor() {
    const a = this.session()?.accuracy ?? 0;
    return a >= 80 ? 'var(--green)' : a >= 60 ? 'var(--amber)' : 'var(--coral)';
  }

  goHome()     { this.router.navigate(['/home']); }
  tryAgain()   {
    const sl = this.session()?.subLevelId;
    const dt = this.session()?.drillType;
    this.router.navigate(['/drill'], { queryParams: { subLevelId: sl, drillType: dt } });
  }
  goProgress() { this.router.navigate(['/progress']); }
}