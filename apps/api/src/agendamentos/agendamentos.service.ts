import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { StatusAgendamento } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { TutoresService } from '../tutores/tutores.service';

import { CriarAgendamentoDto } from './dto/criar-agendamento.dto';
import { AtualizarAgendamentoDto } from './dto/atualizar-agendamento.dto';
import { ListarAgendamentosDto } from './dto/listar-agendamentos.dto';

const SELECT_AGENDAMENTO = {
    id: true,
    dataHora: true,
    status: true,
    observacoes: true,
    criadoEm: true,
    atualizadoEm: true,
    pet: {
        select: { id: true, nome: true, especie: true },
    },
    servico: {
        select: { id: true, nome: true, preco: true, duracaoMinutos: true },
    },
} as const;

@Injectable()
export class AgendamentosService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tutoresService: TutoresService,
    ) {}

    private formatar<T extends { servico: { preco: unknown } }>(agendamento: T) {
        return {
            ...agendamento,
            servico: { ...agendamento.servico, preco: Number(agendamento.servico.preco) },
        };
    }

    private validarDataFutura(dataHora: Date) {
        if (Number.isNaN(dataHora.getTime())) {
            throw new BadRequestException('Data e hora inválidas');
        }

        if (dataHora.getTime() <= Date.now()) {
            throw new BadRequestException('A data do agendamento precisa ser no futuro');
        }
    }

    /** O pet precisa ser do tutor autenticado. */
    private async garantirPetDoTutor(tutorId: string, petId: string) {
        const pet = await this.prisma.pet.findFirst({
            where: { id: petId, tutorId },
            select: { id: true },
        });

        if (!pet) {
            throw new NotFoundException('Pet não encontrado');
        }
    }

    /** Só dá para agendar serviço que está no catálogo ativo. */
    private async garantirServicoAtivo(servicoId: string) {
        const servico = await this.prisma.servico.findFirst({
            where: { id: servicoId, ativo: true },
            select: { id: true },
        });

        if (!servico) {
            throw new NotFoundException('Serviço não encontrado ou inativo');
        }
    }

    /** Evita dois atendimentos do mesmo pet no mesmo horário. */
    private async garantirHorarioLivre(petId: string, dataHora: Date, ignorarId?: string) {
        const conflito = await this.prisma.agendamento.findFirst({
            where: {
                petId,
                dataHora,
                status: StatusAgendamento.AGENDADO,
                id: ignorarId ? { not: ignorarId } : undefined,
            },
            select: { id: true },
        });

        if (conflito) {
            throw new ConflictException('Este pet já tem um agendamento neste horário');
        }
    }

    async criar(usuarioId: string, dto: CriarAgendamentoDto) {
        const tutorId = await this.tutoresService.obterIdPorUsuario(usuarioId);
        const dataHora = new Date(dto.dataHora);

        this.validarDataFutura(dataHora);

        await this.garantirPetDoTutor(tutorId, dto.petId);
        await this.garantirServicoAtivo(dto.servicoId);
        await this.garantirHorarioLivre(dto.petId, dataHora);

        const agendamento = await this.prisma.agendamento.create({
            data: {
                petId: dto.petId,
                servicoId: dto.servicoId,
                dataHora,
                observacoes: dto.observacoes,
            },
            select: SELECT_AGENDAMENTO,
        });

        return this.formatar(agendamento);
    }

    async listar(usuarioId: string, filtro: ListarAgendamentosDto) {
        const tutorId = await this.tutoresService.obterIdPorUsuario(usuarioId);

        const agendamentos = await this.prisma.agendamento.findMany({
            where: {
                pet: { tutorId },
                status: filtro.status,
            },
            orderBy: { dataHora: 'asc' },
            select: SELECT_AGENDAMENTO,
        });

        return agendamentos.map((agendamento) => this.formatar(agendamento));
    }

    async buscarPorId(usuarioId: string, id: string) {
        const tutorId = await this.tutoresService.obterIdPorUsuario(usuarioId);

        const agendamento = await this.prisma.agendamento.findFirst({
            where: { id, pet: { tutorId } },
            select: SELECT_AGENDAMENTO,
        });

        if (!agendamento) {
            throw new NotFoundException('Agendamento não encontrado');
        }

        return this.formatar(agendamento);
    }

    async atualizar(usuarioId: string, id: string, dto: AtualizarAgendamentoDto) {
        const atual = await this.buscarPorId(usuarioId, id);

        if (atual.status !== StatusAgendamento.AGENDADO) {
            throw new BadRequestException(
                'Somente agendamentos com status AGENDADO podem ser alterados',
            );
        }

        let dataHora: Date | undefined;

        if (dto.dataHora) {
            dataHora = new Date(dto.dataHora);

            this.validarDataFutura(dataHora);
            await this.garantirHorarioLivre(atual.pet.id, dataHora, id);
        }

        if (dto.servicoId) {
            await this.garantirServicoAtivo(dto.servicoId);
        }

        const agendamento = await this.prisma.agendamento.update({
            where: { id },
            data: {
                servicoId: dto.servicoId,
                dataHora,
                observacoes: dto.observacoes,
            },
            select: SELECT_AGENDAMENTO,
        });

        return this.formatar(agendamento);
    }

    /** Cancelamento é mudança de status: o histórico do tutor continua visível. */
    async cancelar(usuarioId: string, id: string) {
        const atual = await this.buscarPorId(usuarioId, id);

        if (atual.status === StatusAgendamento.CANCELADO) {
            throw new BadRequestException('Este agendamento já está cancelado');
        }

        if (atual.status === StatusAgendamento.CONCLUIDO) {
            throw new BadRequestException('Um agendamento concluído não pode ser cancelado');
        }

        const agendamento = await this.prisma.agendamento.update({
            where: { id },
            data: { status: StatusAgendamento.CANCELADO },
            select: SELECT_AGENDAMENTO,
        });

        return this.formatar(agendamento);
    }

    async concluir(usuarioId: string, id: string) {
        const atual = await this.buscarPorId(usuarioId, id);

        if (atual.status !== StatusAgendamento.AGENDADO) {
            throw new BadRequestException(
                'Somente agendamentos com status AGENDADO podem ser concluídos',
            );
        }

        const agendamento = await this.prisma.agendamento.update({
            where: { id },
            data: { status: StatusAgendamento.CONCLUIDO },
            select: SELECT_AGENDAMENTO,
        });

        return this.formatar(agendamento);
    }
}
