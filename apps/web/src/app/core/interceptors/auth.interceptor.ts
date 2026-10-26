import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const authService = inject(AuthService);
    const token = authService.obterToken();

    const apiAuth = 'http://localhost:3000/auth/';

    const rotaPublica = request.url === `${apiAuth}login` || request.url === `'${apiAuth}register`;

    if (!token || !request.url.startsWith(apiAuth) || rotaPublica) {
        return next(request);
    }

    const requestAutenticada = request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });

    return next(requestAutenticada);
};
