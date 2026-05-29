import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './core/auth.service';
import { Router } from '@angular/router';

const childGuard = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.role() === 'child') return true;
  router.navigate(['/login']);
  return false;
};

const parentGuard = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.role() === 'parent') return true;
  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'setup',
    loadComponent: () =>
      import('./features/setup/setup.component').then(m => m.SetupComponent),
  },
  {
    path: 'home',
    canActivate: [childGuard],
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'drill',
    canActivate: [childGuard],
    loadComponent: () =>
      import('./features/drill/drill.component').then(m => m.DrillComponent),
  },
  {
    path: 'summary',
    canActivate: [childGuard],
    loadComponent: () =>
      import('./features/summary/summary.component').then(m => m.SummaryComponent),
  },
  {
    path: 'progress',
    canActivate: [childGuard],
    loadComponent: () =>
      import('./features/progress/progress.component').then(m => m.ProgressComponent),
  },
  {
    path: 'parent',
    canActivate: [parentGuard],
    loadComponent: () =>
      import('./features/parent/parent.component').then(m => m.ParentComponent),
  },
  {
    path: 'settings',
    canActivate: [parentGuard],
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
  },
  { path: '**', redirectTo: 'login' },
];