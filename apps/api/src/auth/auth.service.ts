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

/** Formato esperado pelo front (core/models.ts → Usuario). */
const SELECT_USUARIO = {
    id: true,
    nome: true,
    email: true,
    funcao: true,
} as const;

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    // Cria a conta de acesso de quem trabalha no petshop.
    async register(dto: RegisterDto) {
        if (Buffer.byteLength(dto.senha, 'utf-8') > 72) {
            throw new BadRequestException('A senha deve ter no máximo 72 bytes');
        }

        const senhaHash = await bcrypt.hash(dto.senha, 12);

        try {
            return await this.prisma.usuario.create({
                data: {
                    nome: dto.nome,
                    email: dto.email,
                    funcao: dto.funcao,
                    senhaHash,
                },
                select: SELECT_USUARIO,
            });
            // Validação de e-mail já existente para não criar conflito.
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Este e-mail já está cadastrado');
            }

            throw error;
        }
    }

    async login(dto: LoginDto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { email: dto.email },
        });

        // Mesma mensagem nos dois casos: não revela se o e-mail existe.
        if (!usuario) {
            throw new UnauthorizedException('E-mail ou senha incorretos');
        }

        const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);

        if (!senhaValida) {
            throw new UnauthorizedException('E-mail ou senha incorretos');
        }

        const access_token = await this.jwtService.signAsync({ sub: usuario.id });

        return {
            access_token,
            token_type: 'Bearer',
            expires_in: 3600, // 1 Hora
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                funcao: usuario.funcao,
            },
        };
    }

    async me(usuarioId: string) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: SELECT_USUARIO,
        });

        if (!usuario) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        return usuario;
    }
}
