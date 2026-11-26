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
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';

import { ServicosService } from './servicos.service';
import { AtualizarServicoDto, CriarServicoDto } from './dto/salvar-servico.dto';

@ApiTags('Serviços')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado' })
@UseGuards(AuthGuard)
@Controller('servicos')
export class ServicosController {
    constructor(private readonly servicosService: ServicosService) {}

    @Get()
    @ApiOperation({ summary: 'Listar serviços' })
    @ApiOkResponse({ description: 'Lista de serviços' })
    listar() {
        return this.servicosService.listar();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar um serviço' })
    @ApiOkResponse({ description: 'Dados do serviço' })
    @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
    buscar(@Param('id', ParseUUIDPipe) id: string) {
        return this.servicosService.buscarPorId(id);
    }

    @Post()
    @ApiOperation({ summary: 'Cadastrar serviço' })
    @ApiCreatedResponse({ description: 'Serviço cadastrado' })
    @ApiBadRequestResponse({ description: 'Dados inválidos' })
    @ApiConflictResponse({ description: 'Já existe um serviço com este nome' })
    criar(@Body() dto: CriarServicoDto) {
        return this.servicosService.criar(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar serviço' })
    @ApiOkResponse({ description: 'Serviço atualizado' })
    @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
    @ApiConflictResponse({ description: 'Já existe um serviço com este nome' })
    atualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarServicoDto) {
        return this.servicosService.atualizar(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir serviço' })
    @ApiNoContentResponse({ description: 'Serviço excluído' })
    @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
    @ApiConflictResponse({ description: 'Serviço com agendamentos vinculados' })
    remover(@Param('id', ParseUUIDPipe) id: string) {
        return this.servicosService.remover(id);
    }
}
