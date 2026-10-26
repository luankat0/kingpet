import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    // Função para registrar novos USUÁRIOS - Luan Kato
    async register(dto: RegisterDto) {
        if (Buffer.byteLength(dto.senha, 'utf-8') > 72) {
            throw new BadRequestException('A senha deve ter no máximo 72 bytes');
        }

        const senhaHash = await bcrypt.hash(dto.senha, 12);

        try {
            const usuario = await this.prisma.usuario.create({
                data: {
                    email: dto.email,
                    senhaHash,
                    tutor: {
                        create: {
                            nome: dto.nome,
                            telefone: dto.telefone,
                            endereco: dto.endereco,
                        },
                    },
                },
                select: {
                    id: true,
                    email: true,
                    tutor: {
                        select: {
                            id: true,
                            nome: true,
                            telefone: true,
                            endereco: true,
                        },
                    },
                },
            });

            return usuario;
            // Validação de Email já existente para não criar conflito.
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Este e-mail já está cadastrado');
            }

            throw error;
        }
    }

    // Função para fazer login de usuários já existentes - Luan Kato
    async login(dto: LoginDto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { email: dto.email },
        });

        // Validações caso usuário tenha digitado senha ou email errados
        // Não existentes ou não correspondentes
        if (!usuario) {
            throw new UnauthorizedException('E-mail ou senha inválidos');
        }

        const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);

        if (!senhaValida) {
            throw new UnauthorizedException('E-mail ou senha inválidos');
        }

        const access_token = await this.jwtService.signAsync({
            sub: usuario.id,
        });

        return {
            access_token,
            token_type: 'Bearer',
            expires_in: 3600, // 1 Hora
        };
    }

    // Função para encontrar/identificar usuários - Luan Kato
    async me(usuarioId: string) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                id: true,
                email: true,
                tutor: {
                    select: {
                        id: true,
                        nome: true,
                        telefone: true,
                        endereco: true,
                    },
                },
            },
        });

        if (!usuario) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        return usuario;
    }
}
