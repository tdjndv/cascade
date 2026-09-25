// apps/frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/feed/feed.component').then((m) => m.FeedComponent),
  },
  {
    path: 'submit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/submit/submit.component').then((m) => m.SubmitComponent),
  },
  {
    path: 'post/:id',
    loadComponent: () =>
      import('./features/post-detail/post-detail.component').then(
        (m) => m.PostDetailComponent,
      ),
  },
  {
    path: 'user/:username',
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'signin',
    loadComponent: () =>
      import('./features/sign-in/sign-in.component').then((m) => m.SignInComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/sign-up/sign-up.component').then((m) => m.SignUpComponent),
  },
  { path: '**', redirectTo: '' },
];