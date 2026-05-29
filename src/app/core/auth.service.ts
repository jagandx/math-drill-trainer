import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from './db.service';
import { ChildProfile } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _role    = signal<'child' | 'parent' | null>(null);
  private _childId = signal<string | null>(null);
  private _child   = signal<ChildProfile | null>(null);

  readonly role    = this._role.asReadonly();
  readonly childId = this._childId.asReadonly();
  readonly child   = this._child.asReadonly();
  readonly isLoggedIn = computed(() => this._role() !== null);

  constructor(private db: DbService, private router: Router) {}

  async loginAsChild(childId: string): Promise<void> {
    const child = await this.db.getChild(childId);
    if (!child) return;
    this._role.set('child');
    this._childId.set(childId);
    this._child.set(child);
    this.router.navigate(['/home']);
  }

  async loginAsParent(pin: string): Promise<boolean> {
    const parent = await this.db.getParent();
    if (!parent) return false;
    const valid = await this.db.verifyPin(pin, parent.pinHash);
    if (!valid) return false;
    this._role.set('parent');
    this._childId.set(null);
    this._child.set(null);
    this.router.navigate(['/parent']);
    return true;
  }

  logout(): void {
    this._role.set(null);
    this._childId.set(null);
    this._child.set(null);
    this.router.navigate(['/login']);
  }

  // Refresh child data after session saved
  async refreshChild(): Promise<void> {
    const id = this._childId();
    if (!id) return;
    const child = await this.db.getChild(id);
    if (child) this._child.set(child);
  }

  // Called on app init — check if setup is needed
  async checkInit(): Promise<'setup' | 'login'> {
    const parent = await this.db.getParent();
    return parent ? 'login' : 'setup';
  }
}