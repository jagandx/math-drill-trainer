import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(public auth: AuthService) {}

  get showNav()      { return this.auth.role() === 'child'; }
  get childName()    { return this.auth.child()?.name ?? ''; }
  get childAvatar()  { return this.auth.child()?.avatar ?? ''; }

  logout() { this.auth.logout(); }
}