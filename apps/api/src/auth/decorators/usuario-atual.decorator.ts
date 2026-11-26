import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { JwtPayload } from '../auth.guard';

/**
 * Atalho para ler o id do usuário autenticado (sub do JWT) direto no controller.
 * Usar sempre junto com o AuthGuard.
 */
export const UsuarioAtual = createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();

    return request.user?.sub as string;
});
