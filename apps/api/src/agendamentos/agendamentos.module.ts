import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { AgendamentosController } from './agendamentos.controller';
import { AgendamentosService } from './agendamentos.service';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [AgendamentosController],
    providers: [AgendamentosService],
    exports: [AgendamentosService],
})
export class AgendamentosModule {}
