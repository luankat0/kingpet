import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { TutoresService } from '../tutores/tutores.service';

import { CriarPetDto } from './dto/criar-pet.dto';
import { AtualizarPetDto } from './dto/atualizar-pet.dto';

const SELECT_PET = {
    id: true,
    nome: true,
    especie: true,
    raca: true,
    porte: true,
    dataNascimento: true,
    observacoes: true,
    criadoEm: true,
    atualizadoEm: true,
} as const;

@Injectable()
export class PetsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tutoresService: TutoresService,
    ) {}

    async criar(usuarioId: string, dto: CriarPetDto) {
        const tutorId = await this.tutoresService.obterIdPorUsuario(usuarioId);

        return this.prisma.pet.create({
            data: {
                nome: dto.nome,
                especie: dto.especie,
                raca: dto.raca,
                porte: dto.porte,
                dataNascimento: dto.dataNascimento ? new Date(dto.dataNascimento) : undefined,
                observacoes: dto.observacoes,
                tutorId,
            },
            select: SELECT_PET,
        });
    }

    async listar(usuarioId: string) {
        const tutorId = await this.tutoresService.obterIdPorUsuario(usuarioId);

        return this.prisma.pet.findMany({
            where: { tutorId },
            orderBy: { nome: 'asc' },
            select: SELECT_PET,
        });
    }

    async buscarPorId(usuarioId: string, id: string) {
        const tutorId = await this.tutoresService.obterIdPorUsuario(usuarioId);

        const pet = await this.prisma.pet.findFirst({
            where: { id, tutorId },
            select: SELECT_PET,
        });

        if (!pet) {
            throw new NotFoundException('Pet não encontrado');
        }

        return pet;
    }

    async atualizar(usuarioId: string, id: string, dto: AtualizarPetDto) {
        // Garante que o pet existe E pertence a quem está pedindo.
        await this.buscarPorId(usuarioId, id);

        return this.prisma.pet.update({
            where: { id },
            data: {
                nome: dto.nome,
                especie: dto.especie,
                raca: dto.raca,
                porte: dto.porte,
                dataNascimento: dto.dataNascimento ? new Date(dto.dataNascimento) : undefined,
                observacoes: dto.observacoes,
            },
            select: SELECT_PET,
        });
    }

    async remover(usuarioId: string, id: string) {
        await this.buscarPorId(usuarioId, id);

        await this.prisma.pet.delete({ where: { id } });
    }
}
