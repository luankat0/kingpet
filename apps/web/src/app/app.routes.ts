import { Routes } from '@angular/router';

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
        path: '**',
        redirectTo: 'cadastro',
    },
];
