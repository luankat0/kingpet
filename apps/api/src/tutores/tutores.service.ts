import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { AtualizarTutorDto } from './dto/atualizar-tutor.dto';

const SELECT_TUTOR = {
    id: true,
    nome: true,
    telefone: true,
    endereco: true,
    criadoEm: true,
    atualizadoEm: true,
} as const;

@Injectable()
export class TutoresService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Resolve o tutor dono da requisição a partir do usuário autenticado.
     * Os outros módulos usam esse id para garantir que ninguém veja dado de outro tutor.
     */
    async obterIdPorUsuario(usuarioId: string): Promise<string> {
        const tutor = await this.prisma.tutor.findUnique({
            where: { usuarioId },
            select: { id: true },
        });

        if (!tutor) {
            throw new NotFoundException('Tutor não encontrado para este usuário');
        }

        return tutor.id;
    }

    async perfil(usuarioId: string) {
        const tutor = await this.prisma.tutor.findUnique({
            where: { usuarioId },
            select: {
                ...SELECT_TUTOR,
                usuario: {
                    select: { id: true, email: true },
                },
            },
        });

        if (!tutor) {
            throw new NotFoundException('Tutor não encontrado para este usuário');
        }

        return tutor;
    }

    async atualizarPerfil(usuarioId: string, dto: AtualizarTutorDto) {
        const tutorId = await this.obterIdPorUsuario(usuarioId);

        return this.prisma.tutor.update({
            where: { id: tutorId },
            data: {
                nome: dto.nome,
                telefone: dto.telefone,
                endereco: dto.endereco,
            },
            select: SELECT_TUTOR,
        });
    }
}
