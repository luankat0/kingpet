import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { comPrecoNumerico } from '../common/decimal';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { AtualizarServicoDto, CriarServicoDto } from './dto/salvar-servico.dto';

const SELECT_SERVICO = {
    id: true,
    nome: true,
    descricao: true,
    preco: true,
} as const;

@Injectable()
export class ServicosService {
    constructor(private readonly prisma: PrismaService) {}

    async listar() {
        const servicos = await this.prisma.servico.findMany({
            orderBy: { nome: 'asc' },
            select: SELECT_SERVICO,
        });

        return servicos.map(comPrecoNumerico);
    }

    async buscarPorId(id: string) {
        const servico = await this.prisma.servico.findUnique({
            where: { id },
            select: SELECT_SERVICO,
        });

        if (!servico) {
            throw new NotFoundException('Serviço não encontrado');
        }

        return comPrecoNumerico(servico);
    }

    async criar(dto: CriarServicoDto) {
        try {
            const servico = await this.prisma.servico.create({
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    preco: dto.preco,
                },
                select: SELECT_SERVICO,
            });

            return comPrecoNumerico(servico);
        } catch (error: unknown) {
            throw this.traduzir(error);
        }
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
                },
                select: SELECT_SERVICO,
            });

            return comPrecoNumerico(servico);
        } catch (error: unknown) {
            throw this.traduzir(error);
        }
    }

    async remover(id: string) {
        await this.buscarPorId(id);

        const agendamentos = await this.prisma.agendamento.count({ where: { servicoId: id } });

        if (agendamentos > 0) {
            throw new ConflictException('Este registro possui agendamentos vinculados.');
        }

        await this.prisma.servico.delete({ where: { id } });
    }

    private traduzir(error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return new ConflictException('Já existe um serviço com este nome.');
        }

        return error;
    }
}
