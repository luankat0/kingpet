import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator';

import { AgendamentosService } from './agendamentos.service';
import { CriarAgendamentoDto } from './dto/criar-agendamento.dto';
import { AtualizarAgendamentoDto } from './dto/atualizar-agendamento.dto';
import { ListarAgendamentosDto } from './dto/listar-agendamentos.dto';

@ApiTags('Agendamentos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado' })
@UseGuards(AuthGuard)
@Controller('agendamentos')
export class AgendamentosController {
    constructor(private readonly agendamentosService: AgendamentosService) {}

    @Post()
    @ApiOperation({ summary: 'Agendar um serviço para um pet do tutor autenticado' })
    @ApiCreatedResponse({ description: 'Agendamento criado' })
    @ApiBadRequestResponse({ description: 'Dados inválidos ou data no passado' })
    @ApiNotFoundResponse({ description: 'Pet ou serviço não encontrado' })
    @ApiConflictResponse({ description: 'O pet já tem um agendamento neste horário' })
    criar(@UsuarioAtual() usuarioId: string, @Body() dto: CriarAgendamentoDto) {
        return this.agendamentosService.criar(usuarioId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar os agendamentos do tutor autenticado' })
    @ApiOkResponse({ description: 'Lista de agendamentos' })
    listar(@UsuarioAtual() usuarioId: string, @Query() filtro: ListarAgendamentosDto) {
        return this.agendamentosService.listar(usuarioId, filtro);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar um agendamento do tutor autenticado' })
    @ApiOkResponse({ description: 'Dados do agendamento' })
    @ApiNotFoundResponse({ description: 'Agendamento não encontrado' })
    buscar(@UsuarioAtual() usuarioId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.agendamentosService.buscarPorId(usuarioId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Remarcar ou editar um agendamento' })
    @ApiOkResponse({ description: 'Agendamento atualizado' })
    @ApiBadRequestResponse({ description: 'Agendamento não está mais aberto, ou data inválida' })
    @ApiNotFoundResponse({ description: 'Agendamento não encontrado' })
    @ApiConflictResponse({ description: 'O pet já tem um agendamento neste horário' })
    atualizar(
        @UsuarioAtual() usuarioId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AtualizarAgendamentoDto,
    ) {
        return this.agendamentosService.atualizar(usuarioId, id, dto);
    }

    @Patch(':id/cancelar')
    @ApiOperation({ summary: 'Cancelar um agendamento' })
    @ApiOkResponse({ description: 'Agendamento cancelado' })
    @ApiBadRequestResponse({ description: 'Agendamento já cancelado ou concluído' })
    @ApiNotFoundResponse({ description: 'Agendamento não encontrado' })
    cancelar(@UsuarioAtual() usuarioId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.agendamentosService.cancelar(usuarioId, id);
    }

    @Patch(':id/concluir')
    @ApiOperation({ summary: 'Marcar um agendamento como concluído' })
    @ApiOkResponse({ description: 'Agendamento concluído' })
    @ApiBadRequestResponse({ description: 'Agendamento não está mais aberto' })
    @ApiNotFoundResponse({ description: 'Agendamento não encontrado' })
    concluir(@UsuarioAtual() usuarioId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.agendamentosService.concluir(usuarioId, id);
    }
}
