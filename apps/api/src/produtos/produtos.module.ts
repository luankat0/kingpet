import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [ProdutosController],
    providers: [ProdutosService],
    exports: [ProdutosService],
})
export class ProdutosModule {}
