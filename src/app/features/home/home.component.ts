import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/storage.service';
import { AppState, LEVELS, DrillType } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  state   = signal<AppState | null>(null);
  nameInput = '';
  levels  = LEVELS;

  constructor(private storage: StorageService, private router: Router) {}

  ngOnInit() {
    const s = this.storage.load();
    this.state.set(s);
    this.nameInput = s.student.name;
  }

  get student()      { return this.state()?.student; }
  get currentLevel() { return LEVELS.find(l => l.level === this.student?.currentLevel); }
  get recentSessions() {
    return (this.state()?.sessions ?? []).slice(-5).reverse();
  }

  saveName() {
    if (!this.nameInput.trim()) return;
    this.storage.updateStudent({ name: this.nameInput.trim() });
    const s = this.storage.load();
    this.state.set(s);
  }

  startDrill(drillType: DrillType | 'mixed' = 'mixed') {
    this.router.navigate(['/drill'], {
      queryParams: { type: drillType, level: this.student?.currentLevel ?? 1 }
    });
  }
}