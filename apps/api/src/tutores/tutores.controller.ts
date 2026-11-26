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

import { TutoresService } from './tutores.service';
import { AtualizarTutorDto, CriarTutorDto } from './dto/salvar-tutor.dto';

@ApiTags('Tutores')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado' })
@UseGuards(AuthGuard)
@Controller('tutores')
export class TutoresController {
    constructor(private readonly tutoresService: TutoresService) {}

    @Get()
    @ApiOperation({ summary: 'Listar tutores' })
    @ApiOkResponse({ description: 'Lista de tutores' })
    listar() {
        return this.tutoresService.listar();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar um tutor' })
    @ApiOkResponse({ description: 'Dados do tutor' })
    @ApiNotFoundResponse({ description: 'Tutor não encontrado' })
    buscar(@Param('id', ParseUUIDPipe) id: string) {
        return this.tutoresService.buscarPorId(id);
    }

    @Post()
    @ApiOperation({ summary: 'Cadastrar tutor' })
    @ApiCreatedResponse({ description: 'Tutor cadastrado' })
    @ApiBadRequestResponse({ description: 'Dados inválidos' })
    criar(@Body() dto: CriarTutorDto) {
        return this.tutoresService.criar(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar tutor' })
    @ApiOkResponse({ description: 'Tutor atualizado' })
    @ApiNotFoundResponse({ description: 'Tutor não encontrado' })
    atualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarTutorDto) {
        return this.tutoresService.atualizar(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir tutor' })
    @ApiNoContentResponse({ description: 'Tutor excluído' })
    @ApiNotFoundResponse({ description: 'Tutor não encontrado' })
    @ApiConflictResponse({ description: 'Tutor com pets ou agendamentos vinculados' })
    remover(@Param('id', ParseUUIDPipe) id: string) {
        return this.tutoresService.remover(id);
    }
}
