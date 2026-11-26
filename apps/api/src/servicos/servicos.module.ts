import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { ServicosController } from './servicos.controller';
import { ServicosService } from './servicos.service';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [ServicosController],
    providers: [ServicosService],
    exports: [ServicosService],
})
export class ServicosModule {}
