import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { TutoresController } from './tutores.controller';
import { TutoresService } from './tutores.service';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [TutoresController],
    providers: [TutoresService],
    exports: [TutoresService],
})
export class TutoresModule {}
