import {
    Body,
    Controller,
    Delete,
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
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';

import { ServicosService } from './servicos.service';
import { CriarServicoDto } from './dto/criar-servico.dto';
import { AtualizarServicoDto } from './dto/atualizar-servico.dto';
import { ListarServicosDto } from './dto/listar-servicos.dto';

@ApiTags('Serviços')
@Controller('servicos')
export class ServicosController {
    constructor(private readonly servicosService: ServicosService) {}

    @Get()
    @ApiOperation({
        summary: 'Listar serviços do petshop',
        description: 'Rota pública: o catálogo aparece antes do login.',
    })
    @ApiOkResponse({ description: 'Lista de serviços' })
    listar(@Query() filtro: ListarServicosDto) {
        return this.servicosService.listar(filtro);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar um serviço' })
    @ApiOkResponse({ description: 'Dados do serviço' })
    @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
    buscar(@Param('id', ParseUUIDPipe) id: string) {
        return this.servicosService.buscarPorId(id);
    }

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cadastrar um serviço' })
    @ApiCreatedResponse({ description: 'Serviço cadastrado' })
    @ApiBadRequestResponse({ description: 'Dados inválidos' })
    @ApiConflictResponse({ description: 'Já existe um serviço com este nome' })
    criar(@Body() dto: CriarServicoDto) {
        return this.servicosService.criar(dto);
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Atualizar um serviço' })
    @ApiOkResponse({ description: 'Serviço atualizado' })
    @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
    atualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarServicoDto) {
        return this.servicosService.atualizar(id, dto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Desativar um serviço',
        description: 'O serviço sai do catálogo, mas o histórico de agendamentos é preservado.',
    })
    @ApiOkResponse({ description: 'Serviço desativado' })
    @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
    desativar(@Param('id', ParseUUIDPipe) id: string) {
        return this.servicosService.desativar(id);
    }
}
