import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TutoresModule } from '../tutores/tutores.module';

import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
    imports: [PrismaModule, AuthModule, TutoresModule],
    controllers: [PetsController],
    providers: [PetsService],
    exports: [PetsService],
})
export class PetsModule {}
