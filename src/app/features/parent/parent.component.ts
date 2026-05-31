import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DbService } from '../../core/db.service';
import { AuthService } from '../../core/auth.service';
import { ChildProfile, Session, SECTIONS, DRILL_LABELS,
         DrillType, AVATARS, buildInitialProgress } from '../../core/models';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './parent.component.html',
  styleUrl: './parent.component.scss',
})
export class ParentComponent implements OnInit {
  children       = signal<ChildProfile[]>([]);
  selectedChild  = signal<ChildProfile | null>(null);
  childSessions  = signal<Session[]>([]);
  showAddChild   = signal(false);
  showChangePIN  = signal(false);
  Math           = Math;

  // Add child form
  newChildName   = '';
  newChildAvatar = signal(AVATARS[0]);
  addError       = signal('');
  avatars        = AVATARS;

  // Change PIN form
  oldPin   = '';
  newPin   = '';
  pinError = signal('');
  pinSaved = signal(false);

  constructor(
    private db:   DbService,
    private auth: AuthService,
    private router: Router,
    public  theme:  ThemeService,
  ) {}

  async ngOnInit() {
    await this.loadChildren();
  }

  async loadChildren() {
    const children = await this.db.getAllChildren();
    this.children.set(children);
    if (children.length > 0 && !this.selectedChild()) {
      await this.selectChild(children[0]);
    }
  }

  async selectChild(child: ChildProfile) {
    this.selectedChild.set(child);
    const sessions = await this.db.getSessionsForChild(child.id);
    this.childSessions.set(sessions as Session[]);
  }
goSettings() {
  this.router.navigate(['/settings']);
}
  get student()   { return this.selectedChild()?.student; }
  get weakSpots() { return this.selectedChild()?.weakSpots ?? []; }
  get sessions()  { return this.childSessions().slice().reverse(); }

  get avgAccuracy(): number {
    const s = this.childSessions();
    if (!s.length) return 0;
    return Math.round(s.reduce((a,b) => a + b.accuracy, 0) / s.length);
  }
  get passRate(): number {
    const s = this.childSessions();
    if (!s.length) return 0;
    return Math.round((s.filter(x => x.passed).length / s.length) * 100);
  }
  get improvementTrend(): string {
    const s = this.childSessions();
    if (s.length < 4) return '—';
    const half     = Math.floor(s.length / 2);
    const firstAvg = s.slice(0,half).reduce((a,b) => a+b.accuracy,0) / half;
    const lastAvg  = s.slice(half).reduce((a,b)  => a+b.accuracy,0) / (s.length-half);
    const diff     = Math.round(lastAvg - firstAvg);
    return diff > 0 ? `+${diff}%` : `${diff}%`;
  }

  sectionColor(id: string): string {
    return SECTIONS.find(s => s.id === id)?.color ?? '#534AB7';
  }
  drillLabel(type: DrillType): string {
    return DRILL_LABELS[type] ?? type;
  }

  // ── Add child ──────────────────────────────────────────────────────────────
  openAddChild()  { this.showAddChild.set(true); this.newChildName = ''; this.addError.set(''); }
  closeAddChild() { this.showAddChild.set(false); }

  selectAvatar(a: string) { this.newChildAvatar.set(a); }

  async addChild() {
    if (!this.newChildName.trim()) { this.addError.set('Name is required'); return; }
    if (this.children().length >= 3) { this.addError.set('Maximum 3 children allowed'); return; }
    const child = await this.db.createChild(this.newChildName.trim(), this.newChildAvatar());
    this.showAddChild.set(false);
    await this.loadChildren();
    await this.selectChild(child);
  }

  async deleteChild(child: ChildProfile) {
    if (!confirm(`Delete ${child.name}? All their data will be lost.`)) return;
    await this.db.deleteChild(child.id);
    this.selectedChild.set(null);
    this.childSessions.set([]);
    await this.loadChildren();
  }

  // ── Change PIN ─────────────────────────────────────────────────────────────
  openChangePIN()  { this.showChangePIN.set(true); this.oldPin=''; this.newPin=''; this.pinError.set(''); this.pinSaved.set(false); }
  closeChangePIN() { this.showChangePIN.set(false); }

  async submitChangePIN() {
    const parent = await this.db.getParent();
    if (!parent) return;
    const valid = await this.db.verifyPin(this.oldPin, parent.pinHash);
    if (!valid) { this.pinError.set('Current PIN is incorrect'); return; }
    if (this.newPin.length !== 4) { this.pinError.set('New PIN must be 4 digits'); return; }
    const newHash = await this.db.hashPin(this.newPin);
    await this.db.updateParent({ pinHash: newHash });
    this.pinSaved.set(true);
    setTimeout(() => this.closeChangePIN(), 1500);
  }

  // ── Downloads ──────────────────────────────────────────────────────────────
  downloadCSV() {
    const child = this.selectedChild();
    if (!child) return;
    this.db.exportCSV(this.childSessions(), child.name);
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout() { this.auth.logout(); }
}