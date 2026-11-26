import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { CriarServicoDto } from './dto/criar-servico.dto';
import { AtualizarServicoDto } from './dto/atualizar-servico.dto';
import { ListarServicosDto } from './dto/listar-servicos.dto';

const SELECT_SERVICO = {
    id: true,
    nome: true,
    descricao: true,
    preco: true,
    duracaoMinutos: true,
    ativo: true,
    criadoEm: true,
    atualizadoEm: true,
} as const;

interface ServicoBruto {
    preco: Prisma.Decimal;
    [chave: string]: unknown;
}

@Injectable()
export class ServicosService {
    constructor(private readonly prisma: PrismaService) {}

    /** O preço é Decimal no banco; o front espera número. */
    private formatar<T extends ServicoBruto>(servico: T) {
        return { ...servico, preco: Number(servico.preco) };
    }

    async criar(dto: CriarServicoDto) {
        try {
            const servico = await this.prisma.servico.create({
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    preco: dto.preco,
                    duracaoMinutos: dto.duracaoMinutos,
                    ativo: dto.ativo,
                },
                select: SELECT_SERVICO,
            });

            return this.formatar(servico);
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Já existe um serviço com este nome');
            }

            throw error;
        }
    }

    async listar(filtro: ListarServicosDto) {
        const servicos = await this.prisma.servico.findMany({
            where: { ativo: filtro.ativo ?? true },
            orderBy: { nome: 'asc' },
            select: SELECT_SERVICO,
        });

        return servicos.map((servico) => this.formatar(servico));
    }

    async buscarPorId(id: string) {
        const servico = await this.prisma.servico.findUnique({
            where: { id },
            select: SELECT_SERVICO,
        });

        if (!servico) {
            throw new NotFoundException('Serviço não encontrado');
        }

        return this.formatar(servico);
    }

    async atualizar(id: string, dto: AtualizarServicoDto) {
        await this.buscarPorId(id);

        try {
            const servico = await this.prisma.servico.update({
                where: { id },
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    preco: dto.preco,
                    duracaoMinutos: dto.duracaoMinutos,
                    ativo: dto.ativo,
                },
                select: SELECT_SERVICO,
            });

            return this.formatar(servico);
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Já existe um serviço com este nome');
            }

            throw error;
        }
    }

    /**
     * Desativa em vez de apagar: agendamentos antigos continuam apontando para o serviço.
     */
    async desativar(id: string) {
        await this.buscarPorId(id);

        const servico = await this.prisma.servico.update({
            where: { id },
            data: { ativo: false },
            select: SELECT_SERVICO,
        });

        return this.formatar(servico);
    }
}
