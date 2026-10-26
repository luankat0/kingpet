import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'cadastro',
    },
    {
        path: 'cadastro',
        title: 'Cadastro de Tutor | King Pet',
        loadComponent: () =>
            import('./pages/tutor-register/tutor-register.component').then(
                (m) => m.TutorRegisterComponent,
            ),
    },
    {
        path: 'login',
        title: 'Login | King Pet',
        loadComponent: () =>
            import('./pages/tutor-login/login.component').then((m) => m.TutorLoginComponent),
    },
    {
        path: 'minha-conta',
        title: 'Minha Conta | King Pet',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./pages/my-account/my-account.component').then((m) => m.MyAccountComponent),
    },
    {
        path: '**',
        redirectTo: 'cadastro',
    },
];
