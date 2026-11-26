import { Injectable } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
    constructor(private readonly prisma: PrismaService) {}

    getHello(): string {
        return 'King Pet API';
    }

    /** Checa se a API sobe E se o banco responde. */
    async health() {
        let banco = 'ok';

        try {
            await this.prisma.$queryRaw`SELECT 1`;
        } catch {
            banco = 'indisponivel';
        }

        return {
            status: banco === 'ok' ? 'ok' : 'degradado',
            banco,
            horario: new Date().toISOString(),
        };
    }
}
