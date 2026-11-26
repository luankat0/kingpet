import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ambiente } from '../config';
import { AuthService } from '../services/auth.service';

/** Anexa o token em toda chamada à API, menos a própria rota de login. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const token = inject(AuthService).obterToken();
    const daApi = request.url.startsWith(ambiente.apiBase + '/');
    const publica = request.url === ambiente.apiBase + '/auth/login';

    if (!token || !daApi || publica) {
        return next(request);
    }

    return next(
        request.clone({
            setHeaders: { Authorization: 'Bearer ' + token },
        }),
    );
};
