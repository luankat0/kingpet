import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator';

import { TutoresService } from './tutores.service';
import { AtualizarTutorDto } from './dto/atualizar-tutor.dto';

@ApiTags('Tutores')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado' })
@UseGuards(AuthGuard)
@Controller('tutores')
export class TutoresController {
    constructor(private readonly tutoresService: TutoresService) {}

    @Get('me')
    @ApiOperation({ summary: 'Consultar o perfil do tutor autenticado' })
    @ApiOkResponse({ description: 'Perfil do tutor' })
    @ApiNotFoundResponse({ description: 'Tutor não encontrado' })
    perfil(@UsuarioAtual() usuarioId: string) {
        return this.tutoresService.perfil(usuarioId);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Atualizar o perfil do tutor autenticado' })
    @ApiOkResponse({ description: 'Perfil atualizado' })
    @ApiNotFoundResponse({ description: 'Tutor não encontrado' })
    atualizar(@UsuarioAtual() usuarioId: string, @Body() dto: AtualizarTutorDto) {
        return this.tutoresService.atualizarPerfil(usuarioId, dto);
    }
}
