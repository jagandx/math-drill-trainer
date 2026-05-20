import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'drill',
    loadComponent: () =>
      import('./features/drill/drill.component').then(m => m.DrillComponent),
  },
  {
    path: 'summary',
    loadComponent: () =>
      import('./features/summary/summary.component').then(m => m.SummaryComponent),
  },
  {
    path: 'progress',
    loadComponent: () =>
      import('./features/progress/progress.component').then(m => m.ProgressComponent),
  },
  {
    path: 'parent',
    loadComponent: () =>
      import('./features/parent/parent.component').then(m => m.ParentComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];