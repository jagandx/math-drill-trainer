import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DbService } from '../../core/db.service';
import { AVATARS } from '../../core/models';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
})
export class SetupComponent {
  step       = signal<1 | 2>(1);
  avatars    = AVATARS;

  // Step 1 — PIN
  pin        = '';
  pinConfirm = '';
  pinError   = signal('');

  // Step 2 — Child
  childName   = '';
  childAvatar = signal(AVATARS[0]);
  childError  = signal('');
  saving      = signal(false);

  constructor(private db: DbService, private router: Router) {}

  // Step 1
  async submitPin() {
    if (this.pin.length !== 4 || !/^\d{4}$/.test(this.pin)) {
      this.pinError.set('PIN must be exactly 4 digits');
      return;
    }
    if (this.pin !== this.pinConfirm) {
      this.pinError.set('PINs do not match');
      return;
    }
    await this.db.createParent(this.pin);
    this.step.set(2);
  }

  // Step 2
  selectAvatar(a: string) {
    this.childAvatar.set(a);
  }

  async submitChild() {
    if (!this.childName.trim()) {
      this.childError.set('Please enter a name');
      return;
    }
    this.saving.set(true);
    await this.db.createChild(this.childName.trim(), this.childAvatar());
    this.router.navigate(['/login']);
  }

  onPinKey(e: KeyboardEvent)  { if (e.key === 'Enter') this.submitPin(); }
  onChildKey(e: KeyboardEvent){ if (e.key === 'Enter') this.submitChild(); }
}