import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadChildren: () => import('./home/home.routes'),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadChildren: () => import('./perfil/perfil.routes'),
  },
  {
    path: 'tablon',
    canActivate: [authGuard],
    loadChildren: () => import('./tablon/tablon.routes'),
  },
  {
    path: 'calendar',
    canActivate: [authGuard],
    loadChildren: () => import('./calendar/calendar.routes'),
  },
  {
    path: 'notas',
    canActivate: [authGuard],
    loadChildren: () => import('./notas/notas.routes'),
  },
  {
    path: 'padres',
    canActivate: [authGuard],
    loadChildren: () => import('./padres/padres.routes'),
  },
  {
    path: '**',
    redirectTo: 'auth',
  }
];