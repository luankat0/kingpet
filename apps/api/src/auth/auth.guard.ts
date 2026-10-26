import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface JwtPayload {
    sub: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();

        const authorization = request.headers.authorization;

        const [scheme, token] = authorization?.split(' ') ?? [];

        if (scheme !== 'Bearer' || !token) {
            throw new UnauthorizedException('Token não informado');
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

            if (typeof payload.sub !== 'string') {
                throw new Error('Payload inválido');
            }

            request.user = payload;

            return true;
        } catch {
            throw new UnauthorizedException('Token inválido ou expirado');
        }
    }
}
