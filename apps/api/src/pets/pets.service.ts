import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { AtualizarPetDto, CriarPetDto } from './dto/salvar-pet.dto';

const SELECT_PET = {
    id: true,
    nome: true,
    especie: true,
    raca: true,
    sexo: true,
    tutorId: true,
} as const;

@Injectable()
export class PetsService {
    constructor(private readonly prisma: PrismaService) {}

    listar(tutorId?: string) {
        return this.prisma.pet.findMany({
            where: tutorId ? { tutorId } : undefined,
            orderBy: { nome: 'asc' },
            select: SELECT_PET,
        });
    }

    async buscarPorId(id: string) {
        const pet = await this.prisma.pet.findUnique({
            where: { id },
            select: SELECT_PET,
        });

        if (!pet) {
            throw new NotFoundException('Pet não encontrado');
        }

        return pet;
    }

    private async garantirTutor(tutorId: string) {
        const tutor = await this.prisma.tutor.findUnique({
            where: { id: tutorId },
            select: { id: true },
        });

        if (!tutor) {
            throw new NotFoundException('Selecione um tutor existente.');
        }
    }

    async criar(dto: CriarPetDto) {
        await this.garantirTutor(dto.tutorId);

        return this.prisma.pet.create({
            data: {
                nome: dto.nome,
                especie: dto.especie,
                raca: dto.raca,
                sexo: dto.sexo,
                tutorId: dto.tutorId,
            },
            select: SELECT_PET,
        });
    }

    async atualizar(id: string, dto: AtualizarPetDto) {
        const atual = await this.buscarPorId(id);

        if (dto.tutorId && dto.tutorId !== atual.tutorId) {
            await this.garantirTutor(dto.tutorId);

            // Trocar o tutor deixaria os agendamentos apontando para o tutor antigo.
            const vinculados = await this.prisma.agendamento.count({ where: { petId: id } });

            if (vinculados > 0) {
                throw new ConflictException(
                    'O pet possui agendamentos vinculados. Mantenha o tutor desses registros.',
                );
            }
        }

        return this.prisma.pet.update({
            where: { id },
            data: {
                nome: dto.nome,
                especie: dto.especie,
                raca: dto.raca,
                sexo: dto.sexo,
                tutorId: dto.tutorId,
            },
            select: SELECT_PET,
        });
    }

    async remover(id: string) {
        await this.buscarPorId(id);

        const agendamentos = await this.prisma.agendamento.count({ where: { petId: id } });

        if (agendamentos > 0) {
            throw new ConflictException('Este registro possui agendamentos vinculados.');
        }

        await this.prisma.pet.delete({ where: { id } });
    }
}
