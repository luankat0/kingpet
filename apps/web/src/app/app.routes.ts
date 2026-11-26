import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { TIPOS } from './core/models';
import { catalogo } from './shared/catalogo';
import type { Formulario } from './pages/registros/formulario';
const form = () => import('./pages/registros/formulario').then((m) => m.Formulario);
const proteger = [(c: Formulario) => c.pendente()];
const entidades: Routes = TIPOS.flatMap((tipo) => [
    {
        path: tipo,
        title: catalogo[tipo].nome + ' | KingPet',
        data: { tipo },
        loadComponent: () => import('./pages/registros/lista').then((m) => m.Lista),
    },
    {
        path: tipo + '/novo',
        title: catalogo[tipo].novo + ' | KingPet',
        data: { tipo },
        loadComponent: form,
        canDeactivate: proteger,
    },
    {
        path: tipo + '/:id/editar',
        title: 'Editar ' + catalogo[tipo].singular + ' | KingPet',
        data: { tipo },
        loadComponent: form,
        canDeactivate: proteger,
    },
    {
        path: tipo + '/:id',
        title: catalogo[tipo].singular + ' | KingPet',
        data: { tipo },
        loadComponent: () => import('./pages/registros/detalhe').then((m) => m.Detalhe),
    },
]);
export const routes: Routes = [
    {
        path: 'login',
        title: 'Entrar | KingPet',
        loadComponent: () =>
            import('./pages/tutor-login/login.component').then((m) => m.TutorLoginComponent),
    },
    { path: 'cadastro', redirectTo: 'tutores/novo', pathMatch: 'full' },
    { path: 'minha-conta', redirectTo: 'perfil', pathMatch: 'full' },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./layout/shell').then((m) => m.Shell),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            {
                path: 'dashboard',
                title: 'Dashboard | KingPet',
                loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
            },
            {
                path: 'perfil',
                title: 'Meu perfil | KingPet',
                loadComponent: () =>
                    import('./pages/my-account/my-account.component').then(
                        (m) => m.MyAccountComponent,
                    ),
            },
            ...entidades,
        ],
    },
    {
        path: '**',
        title: 'Página não encontrada | KingPet',
        loadComponent: () => import('./shared/ausente').then((m) => m.Ausente),
    },
];
