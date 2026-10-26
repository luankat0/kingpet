import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';

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

import type { Request } from 'express';

import { AuthService } from './auth.service';
import { AuthGuard, JwtPayload } from './auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({
        summary: 'Cadastrar tutor',
        description: 'Cria a conta e o cadastro do tutor.',
    })
    @ApiCreatedResponse({
        description: 'Tutor cadastrado com sucesso',
    })
    @ApiBadRequestResponse({
        description: 'Dados de cadastro inválidos',
    })
    @ApiConflictResponse({
        description: 'E-mail já cadastrado',
    })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Autenticar tutor',
    })
    @ApiOkResponse({
        description: 'Autenticação realizada com sucesso',
        schema: {
            example: {
                access_token: 'eyJhbGciOi...',
                token_type: 'Bearer',
                expires_in: 3600,
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'E-mail ou senha inválidos',
    })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('me')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Consultar tutor autenticado',
    })
    @ApiOkResponse({
        description: 'Dados da conta e do tutor',
    })
    @ApiUnauthorizedResponse({
        description: 'Token ausente, inválido ou expirado',
    })
    me(@Req() request: Request & { user: JwtPayload }) {
        return this.authService.me(request.user.sub);
    }
}
