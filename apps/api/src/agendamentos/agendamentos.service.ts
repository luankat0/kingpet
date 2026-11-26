import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { AtualizarAgendamentoDto, CriarAgendamentoDto } from './dto/salvar-agendamento.dto';

const SELECT_AGENDAMENTO = {
    id: true,
    dataHora: true,
    status: true,
    tutorId: true,
    petId: true,
    servicoId: true,
} as const;

@Injectable()
export class AgendamentosService {
    constructor(private readonly prisma: PrismaService) {}

    listar() {
        return this.prisma.agendamento.findMany({
            orderBy: { dataHora: 'asc' },
            select: SELECT_AGENDAMENTO,
        });
    }

    async buscarPorId(id: string) {
        const agendamento = await this.prisma.agendamento.findUnique({
            where: { id },
            select: SELECT_AGENDAMENTO,
        });

        if (!agendamento) {
            throw new NotFoundException('Agendamento não encontrado');
        }

        return agendamento;
    }

    /** O pet precisa existir e pertencer ao tutor escolhido. */
    private async garantirVinculos(tutorId: string, petId: string, servicoId: string) {
        const [tutor, pet, servico] = await Promise.all([
            this.prisma.tutor.findUnique({ where: { id: tutorId }, select: { id: true } }),
            this.prisma.pet.findUnique({ where: { id: petId }, select: { tutorId: true } }),
            this.prisma.servico.findUnique({ where: { id: servicoId }, select: { id: true } }),
        ]);

        if (!tutor) {
            throw new NotFoundException('Selecione um tutor existente.');
        }

        if (!pet || pet.tutorId !== tutorId) {
            throw new BadRequestException('O pet deve pertencer ao tutor selecionado.');
        }

        if (!servico) {
            throw new NotFoundException('Selecione um serviço existente.');
        }
    }

    private converterData(valor: string) {
        const dataHora = new Date(valor);

        if (Number.isNaN(dataHora.getTime())) {
            throw new BadRequestException('Revise a data e a situação do agendamento.');
        }

        return dataHora;
    }

    async criar(dto: CriarAgendamentoDto) {
        await this.garantirVinculos(dto.tutorId, dto.petId, dto.servicoId);

        return this.prisma.agendamento.create({
            data: {
                tutorId: dto.tutorId,
                petId: dto.petId,
                servicoId: dto.servicoId,
                dataHora: this.converterData(dto.dataHora),
                status: dto.status,
            },
            select: SELECT_AGENDAMENTO,
        });
    }

    async atualizar(id: string, dto: AtualizarAgendamentoDto) {
        const atual = await this.buscarPorId(id);

        // Revalida o trio completo: trocar só uma das pontas também pode quebrar o vínculo.
        await this.garantirVinculos(
            dto.tutorId ?? atual.tutorId,
            dto.petId ?? atual.petId,
            dto.servicoId ?? atual.servicoId,
        );

        return this.prisma.agendamento.update({
            where: { id },
            data: {
                tutorId: dto.tutorId,
                petId: dto.petId,
                servicoId: dto.servicoId,
                dataHora: dto.dataHora ? this.converterData(dto.dataHora) : undefined,
                status: dto.status,
            },
            select: SELECT_AGENDAMENTO,
        });
    }

    async remover(id: string) {
        await this.buscarPorId(id);

        await this.prisma.agendamento.delete({ where: { id } });
    }
}
