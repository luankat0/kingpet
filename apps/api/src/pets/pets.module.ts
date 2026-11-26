import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [PetsController],
    providers: [PetsService],
    exports: [PetsService],
})
export class PetsModule {}
