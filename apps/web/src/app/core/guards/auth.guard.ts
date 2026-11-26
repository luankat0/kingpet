import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (_, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return (
        (await auth.restaurar()) ||
        router.createUrlTree(['/login'], { queryParams: { voltar: state.url } })
    );
};
