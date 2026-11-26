import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { AtualizarTutorDto, CriarTutorDto } from './dto/salvar-tutor.dto';

const SELECT_TUTOR = {
    id: true,
    nome: true,
    contato: true,
    telefone: true,
    endereco: true,
} as const;

@Injectable()
export class TutoresService {
    constructor(private readonly prisma: PrismaService) {}

    listar() {
        return this.prisma.tutor.findMany({
            orderBy: { nome: 'asc' },
            select: SELECT_TUTOR,
        });
    }

    async buscarPorId(id: string) {
        const tutor = await this.prisma.tutor.findUnique({
            where: { id },
            select: SELECT_TUTOR,
        });

        if (!tutor) {
            throw new NotFoundException('Tutor não encontrado');
        }

        return tutor;
    }

    criar(dto: CriarTutorDto) {
        return this.prisma.tutor.create({
            data: {
                nome: dto.nome,
                contato: dto.contato,
                telefone: dto.telefone,
                endereco: dto.endereco,
            },
            select: SELECT_TUTOR,
        });
    }

    async atualizar(id: string, dto: AtualizarTutorDto) {
        await this.buscarPorId(id);

        return this.prisma.tutor.update({
            where: { id },
            data: {
                nome: dto.nome,
                contato: dto.contato,
                telefone: dto.telefone,
                endereco: dto.endereco,
            },
            select: SELECT_TUTOR,
        });
    }

    async remover(id: string) {
        await this.buscarPorId(id);

        // Mesma regra que a tela aplicava localmente, agora garantida no servidor.
        const [pets, agendamentos] = await Promise.all([
            this.prisma.pet.count({ where: { tutorId: id } }),
            this.prisma.agendamento.count({ where: { tutorId: id } }),
        ]);

        if (pets > 0 || agendamentos > 0) {
            throw new ConflictException('Este tutor possui pets ou agendamentos vinculados.');
        }

        await this.prisma.tutor.delete({ where: { id } });
    }
}
