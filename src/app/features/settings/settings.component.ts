import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/storage.service';
import { AppState, SUB_LEVELS, SECTIONS } from '../../core/models';
import { Router } from '@angular/router';
import { getSubLevelsForSection } from '../../core/models';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  state        = signal<AppState | null>(null);
  nameInput    = '';
  showConfirm  = signal(false);
  saved        = signal(false);
  subLevels    = SUB_LEVELS;
  sections     = SECTIONS;

  constructor(private storage: StorageService, private router: Router) {}

  ngOnInit() {
    const s = this.storage.load();
    this.state.set(s);
    this.nameInput = s.student.name;
  }

  get student() { return this.state()?.student; }
getSubLevelsForSection(sectionId: string) {
  return getSubLevelsForSection(sectionId as any);
}
  saveName() {
    if (!this.nameInput.trim()) return;
    this.storage.updateStudent({ name: this.nameInput.trim() });
    this.state.set(this.storage.load());
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }

  setSubLevel(id: string) {
    this.storage.updateStudent({ currentSubLevelId: id });
    this.state.set(this.storage.load());
  }

  confirmReset() { this.showConfirm.set(true); }
  cancelReset()  { this.showConfirm.set(false); }

  resetAll() {
    this.storage.reset();
    this.showConfirm.set(false);
    this.router.navigate(['/home']);
  }
}