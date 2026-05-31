import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService }  from './core/auth.service';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl:    './app.scss',
})
export class App {
  constructor(
    public auth:  AuthService,
    public theme: ThemeService,
  ) {}

  get showNav()     { return this.auth.role() === 'child'; }
  get childName()   { return this.auth.child()?.name   ?? ''; }
  get childAvatar() { return this.auth.child()?.avatar ?? ''; }
  get isDark()      { return this.theme.isDark(); }

  logout() { this.auth.logout(); }
  toggleTheme() { this.theme.toggle(); }
}