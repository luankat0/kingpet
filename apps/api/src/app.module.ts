import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TutoresModule } from './tutores/tutores.module';
import { PetsModule } from './pets/pets.module';
import { ServicosModule } from './servicos/servicos.module';
import { ProdutosModule } from './produtos/produtos.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        TutoresModule,
        PetsModule,
        ServicosModule,
        ProdutosModule,
        AgendamentosModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
