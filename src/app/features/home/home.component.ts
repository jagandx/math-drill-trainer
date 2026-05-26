import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/storage.service';
import {
  AppState,
  SUB_LEVELS,
  SECTIONS,
  DrillType,
  getSubLevel,
  isSectionUnlocked,
  DRILL_LABELS,
} from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  state = signal<AppState | null>(null);
  nameInput = '';
  sections = SECTIONS;

  constructor(
    private storage: StorageService,
    private router: Router,
  ) {}

  ngOnInit() {
    const s = this.storage.load();
    this.state.set(s);
    this.nameInput = s.student.name;
  }

  get student() {
    return this.state()?.student;
  }
  get progress() {
    return this.student?.subLevelProgress ?? {};
  }

  get currentSubLevel() {
    return getSubLevel(this.student?.currentSubLevelId ?? 'A1');
  }

  get currentSection() {
    return SECTIONS.find((s) => s.id === this.currentSubLevel?.section);
  }

  get recentSessions() {
    return (this.state()?.sessions ?? []).slice(-5).reverse();
  }

  get subLevelPassStreak() {
    const id = this.student?.currentSubLevelId ?? 'A1';
    const prog = this.student?.subLevelProgress[id];
    return prog?.consecutivePassCount ?? 0;
  }

  get passStreakRequired() {
    return getSubLevel(this.student?.currentSubLevelId ?? 'A1')?.passStreakRequired ?? 2;
  }

  isSectionUnlocked(sectionId: string) {
    return isSectionUnlocked(sectionId as any, this.progress);
  }

  subLevelsForSection(sectionId: string) {
    return SUB_LEVELS.filter((sl) => sl.section === sectionId);
  }

  subLevelDone(id: string) {
    return this.progress[id]?.completed ?? false;
  }

  subLevelUnlocked(id: string) {
    return this.progress[id]?.unlocked ?? false;
  }

  drillLabel(type: string): string {
    return DRILL_LABELS[type as DrillType] ?? type;
  }

  saveName() {
    if (!this.nameInput.trim()) return;
    this.storage.updateStudent({ name: this.nameInput.trim() });
    this.state.set(this.storage.load());
  }

  startDrill(subLevelId?: string) {
    const id = subLevelId ?? this.student?.currentSubLevelId ?? 'A1';
    const sl = getSubLevel(id);
    this.router.navigate(['/drill'], {
      queryParams: { subLevelId: id, drillType: sl?.drillType },
    });
  }

  doneCountForSection(sectionId: string): number {
    return this.subLevelsForSection(sectionId).filter((sl) => this.subLevelDone(sl.id)).length;
  }
}
