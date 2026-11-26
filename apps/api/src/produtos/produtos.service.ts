import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { comPrecoNumerico } from '../common/decimal';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { AtualizarProdutoDto, CriarProdutoDto } from './dto/salvar-produto.dto';

const SELECT_PRODUTO = {
    id: true,
    nome: true,
    descricao: true,
    preco: true,
    estoque: true,
} as const;

@Injectable()
export class ProdutosService {
    constructor(private readonly prisma: PrismaService) {}

    async listar() {
        const produtos = await this.prisma.produto.findMany({
            orderBy: { nome: 'asc' },
            select: SELECT_PRODUTO,
        });

        return produtos.map(comPrecoNumerico);
    }

    async buscarPorId(id: string) {
        const produto = await this.prisma.produto.findUnique({
            where: { id },
            select: SELECT_PRODUTO,
        });

        if (!produto) {
            throw new NotFoundException('Produto não encontrado');
        }

        return comPrecoNumerico(produto);
    }

    async criar(dto: CriarProdutoDto) {
        try {
            const produto = await this.prisma.produto.create({
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    preco: dto.preco,
                    estoque: dto.estoque,
                },
                select: SELECT_PRODUTO,
            });

            return comPrecoNumerico(produto);
        } catch (error: unknown) {
            throw this.traduzir(error);
        }
    }

    async atualizar(id: string, dto: AtualizarProdutoDto) {
        await this.buscarPorId(id);

        try {
            const produto = await this.prisma.produto.update({
                where: { id },
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    preco: dto.preco,
                    estoque: dto.estoque,
                },
                select: SELECT_PRODUTO,
            });

            return comPrecoNumerico(produto);
        } catch (error: unknown) {
            throw this.traduzir(error);
        }
    }

    async remover(id: string) {
        await this.buscarPorId(id);

        await this.prisma.produto.delete({ where: { id } });
    }

    private traduzir(error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return new ConflictException('Já existe um produto com este nome.');
        }

        return error;
    }
}
