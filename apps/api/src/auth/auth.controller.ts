import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UsuarioAtual } from './decorators/usuario-atual.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({
        summary: 'Cadastrar conta de acesso',
        description: 'Cria a conta de um integrante da equipe do petshop.',
    })
    @ApiCreatedResponse({ description: 'Conta criada com sucesso' })
    @ApiBadRequestResponse({ description: 'Dados de cadastro inválidos' })
    @ApiConflictResponse({ description: 'E-mail já cadastrado' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Autenticar' })
    @ApiOkResponse({
        description: 'Autenticação realizada com sucesso',
        schema: {
            example: {
                access_token: 'eyJhbGciOi...',
                token_type: 'Bearer',
                expires_in: 3600,
                usuario: {
                    id: '0b7c...',
                    nome: 'Alex Martins',
                    email: 'equipe@kingpet.test',
                    funcao: 'Administração',
                },
            },
        },
    })
    @ApiUnauthorizedResponse({ description: 'E-mail ou senha incorretos' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('me')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Consultar o usuário autenticado' })
    @ApiOkResponse({ description: 'Dados da conta' })
    @ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado' })
    me(@UsuarioAtual() usuarioId: string) {
        return this.authService.me(usuarioId);
    }
}
