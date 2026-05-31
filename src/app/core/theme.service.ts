import { Injectable, signal, effect } from '@angular/core';

type Theme = 'light' | 'dark';
const THEME_KEY = 'math_drill_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private _theme = signal<Theme>(this.loadTheme());
  readonly theme = this._theme.asReadonly();
  readonly isDark = () => this._theme() === 'dark';

  constructor() {
    // Apply theme to DOM whenever signal changes
    effect(() => {
      this.applyTheme(this._theme());
    });
  }

  toggle() {
    const next: Theme = this._theme() === 'light' ? 'dark' : 'light';
    this._theme.set(next);
    localStorage.setItem(THEME_KEY, next);
  }

  setTheme(theme: Theme) {
    this._theme.set(theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  private loadTheme(): Theme {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved) return saved;
    // Respect OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }
}