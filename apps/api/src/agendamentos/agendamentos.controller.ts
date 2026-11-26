import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';

import { AgendamentosService } from './agendamentos.service';
import { AtualizarAgendamentoDto, CriarAgendamentoDto } from './dto/salvar-agendamento.dto';

@ApiTags('Agendamentos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado' })
@UseGuards(AuthGuard)
@Controller('agendamentos')
export class AgendamentosController {
    constructor(private readonly agendamentosService: AgendamentosService) {}

    @Get()
    @ApiOperation({ summary: 'Listar agendamentos' })
    @ApiOkResponse({ description: 'Lista de agendamentos' })
    listar() {
        return this.agendamentosService.listar();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar um agendamento' })
    @ApiOkResponse({ description: 'Dados do agendamento' })
    @ApiNotFoundResponse({ description: 'Agendamento não encontrado' })
    buscar(@Param('id', ParseUUIDPipe) id: string) {
        return this.agendamentosService.buscarPorId(id);
    }

    @Post()
    @ApiOperation({ summary: 'Cadastrar agendamento' })
    @ApiCreatedResponse({ description: 'Agendamento cadastrado' })
    @ApiBadRequestResponse({ description: 'Dados inválidos ou pet de outro tutor' })
    @ApiNotFoundResponse({ description: 'Tutor ou serviço não encontrado' })
    criar(@Body() dto: CriarAgendamentoDto) {
        return this.agendamentosService.criar(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar agendamento' })
    @ApiOkResponse({ description: 'Agendamento atualizado' })
    @ApiBadRequestResponse({ description: 'Dados inválidos ou pet de outro tutor' })
    @ApiNotFoundResponse({ description: 'Agendamento, tutor ou serviço não encontrado' })
    atualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarAgendamentoDto) {
        return this.agendamentosService.atualizar(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir agendamento' })
    @ApiNoContentResponse({ description: 'Agendamento excluído' })
    @ApiNotFoundResponse({ description: 'Agendamento não encontrado' })
    remover(@Param('id', ParseUUIDPipe) id: string) {
        return this.agendamentosService.remover(id);
    }
}
