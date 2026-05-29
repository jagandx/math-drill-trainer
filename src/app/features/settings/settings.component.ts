import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DbService }   from '../../core/db.service';
import { AuthService } from '../../core/auth.service';
import {
  SUB_LEVELS, SECTIONS, SubLevel, Section,
  buildInitialProgress, getSubLevelsForSection,
  ChildProfile
} from '../../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  children       = signal<ChildProfile[]>([]);
  selectedChild  = signal<ChildProfile | null>(null);
  showConfirm    = signal(false);
  saved          = signal(false);
  sections       = SECTIONS;

  constructor(
    private db:   DbService,
    private auth: AuthService,
    private router: Router,
  ) {}

  async ngOnInit() {
    const children = await this.db.getAllChildren();
    this.children.set(children);
    if (children.length > 0) {
      this.selectedChild.set(children[0]);
    }
  }

  get student() { return this.selectedChild()?.student; }

  async selectChild(child: ChildProfile) {
    this.selectedChild.set(child);
    this.saved.set(false);
    this.showConfirm.set(false);
  }

  getSubLevelsForSection(sectionId: string): SubLevel[] {
    return getSubLevelsForSection(sectionId as Section);
  }

  isCurrentSubLevel(id: string): boolean {
    return this.student?.currentSubLevelId === id;
  }

  isDone(id: string): boolean {
    return this.student?.subLevelProgress?.[id]?.completed ?? false;
  }

  isUnlocked(id: string): boolean {
    return this.student?.subLevelProgress?.[id]?.unlocked ?? false;
  }

  async setSubLevel(id: string) {
    const child = this.selectedChild();
    if (!child) return;
    child.student.currentSubLevelId = id;
    await this.db.updateChild(child.id, { student: child.student });
    // refresh
    const updated = await this.db.getChild(child.id);
    if (updated) this.selectedChild.set(updated);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 1500);
  }

  confirmReset()  { this.showConfirm.set(true); }
  cancelReset()   { this.showConfirm.set(false); }

async resetAll() {
  const child = this.selectedChild();
  if (!child) return;

  // Delete all session records
  await this.db.deleteSessionsForChild(child.id);

  // Reset student record
  child.student = {
    name:              child.name,
    dailyStreak:       0,
    lastSessionDate:   null,
    totalSessions:     0,
    totalCorrect:      0,
    badges:            [],
    subLevelProgress:  buildInitialProgress(),
    currentSubLevelId: 'A1',
  };
  child.weakSpots = [];
  await this.db.updateChild(child.id, child);

  const updated = await this.db.getChild(child.id);
  if (updated) this.selectedChild.set(updated);
  this.showConfirm.set(false);
}

  goBack() { this.router.navigate(['/parent']); }
}