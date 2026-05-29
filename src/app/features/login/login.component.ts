import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DbService } from '../../core/db.service';
import { AuthService } from '../../core/auth.service';
import { ChildProfile } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  children     = signal<ChildProfile[]>([]);
  showPinEntry = signal(false);
  pin          = '';
  pinError     = signal('');
  loading      = signal(true);

  constructor(
    private db:   DbService,
    private auth: AuthService,
    private router: Router,
  ) {}

  async ngOnInit() {
    const status = await this.auth.checkInit();
    if (status === 'setup') {
      this.router.navigate(['/setup']);
      return;
    }
    const children = await this.db.getAllChildren();
    this.children.set(children);
    this.loading.set(false);
  }

  async loginChild(child: ChildProfile) {
    await this.auth.loginAsChild(child.id);
  }

  openParentLogin() {
    this.pin = '';
    this.pinError.set('');
    this.showPinEntry.set(true);
  }

  closeParentLogin() {
    this.showPinEntry.set(false);
    this.pin = '';
    this.pinError.set('');
  }

  async submitPin() {
    if (this.pin.length !== 4) {
      this.pinError.set('Please enter 4 digits');
      return;
    }
    const ok = await this.auth.loginAsParent(this.pin);
    if (!ok) {
      this.pinError.set('Incorrect PIN. Try again.');
      this.pin = '';
    }
  }

  onPinKey(e: KeyboardEvent) {
    if (e.key === 'Enter') this.submitPin();
  }
}