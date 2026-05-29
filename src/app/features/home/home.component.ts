import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  SUB_LEVELS, SECTIONS, DrillType,
  getSubLevel, isSectionUnlocked, DRILL_LABELS, ChildProfile, Session
} from '../../core/models';
import { AuthService } from '../../core/auth.service';
import { DbService }   from '../../core/db.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  child    = signal<ChildProfile | null>(null);
  sessions = signal<Session[]>([]);
  sections = SECTIONS;

  constructor(
    private db:   DbService,
    private auth: AuthService,
    private router: Router,
  ) {}

  async ngOnInit() {
    await this.auth.refreshChild();
    const c = this.auth.child();
    this.child.set(c);
    if (c) {
      const s = await this.db.getSessionsForChild(c.id);
      this.sessions.set((s as Session[]).slice(-5).reverse());
    }
  }

  // ── Getters ─────────────────────────────────────────────────────────────
  get student()   { return this.child()?.student; }
  get progress()  { return this.student?.subLevelProgress ?? {}; }

  get currentSubLevel() {
    return getSubLevel(this.student?.currentSubLevelId ?? 'A1');
  }
  get currentSection() {
    return SECTIONS.find(s => s.id === this.currentSubLevel?.section);
  }
  get recentSessions() { return this.sessions(); }

  get subLevelPassStreak() {
    const id = this.student?.currentSubLevelId ?? 'A1';
    return this.student?.subLevelProgress?.[id]?.consecutivePassCount ?? 0;
  }
  get passStreakRequired() {
    return getSubLevel(this.student?.currentSubLevelId ?? 'A1')?.passStreakRequired ?? 2;
  }

  // ── Section helpers ──────────────────────────────────────────────────────
  isSectionUnlocked(sectionId: string): boolean {
    return isSectionUnlocked(sectionId as any, this.progress);
  }
  subLevelsForSection(sectionId: string) {
    return SUB_LEVELS.filter(sl => sl.section === sectionId);
  }
  subLevelDone(id: string)     { return this.progress[id]?.completed  ?? false; }
  subLevelUnlocked(id: string) { return this.progress[id]?.unlocked   ?? false; }
  doneCountForSection(sectionId: string): number {
    return this.subLevelsForSection(sectionId).filter(sl => this.subLevelDone(sl.id)).length;
  }
  drillLabel(type: string): string {
    return DRILL_LABELS[type as DrillType] ?? type;
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  startDrill(subLevelId?: string) {
    const id = subLevelId ?? this.student?.currentSubLevelId ?? 'A1';
    const sl = getSubLevel(id);
    this.router.navigate(['/drill'], {
      queryParams: { subLevelId: id, drillType: sl?.drillType }
    });
  }
}