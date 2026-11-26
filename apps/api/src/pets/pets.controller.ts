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
    Query,
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
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';

import { PetsService } from './pets.service';
import { AtualizarPetDto, CriarPetDto } from './dto/salvar-pet.dto';

@ApiTags('Pets')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado' })
@UseGuards(AuthGuard)
@Controller('pets')
export class PetsController {
    constructor(private readonly petsService: PetsService) {}

    @Get()
    @ApiOperation({ summary: 'Listar pets' })
    @ApiQuery({
        name: 'tutorId',
        required: false,
        description: 'Filtra os pets de um tutor',
    })
    @ApiOkResponse({ description: 'Lista de pets' })
    listar(@Query('tutorId', new ParseUUIDPipe({ optional: true })) tutorId?: string) {
        return this.petsService.listar(tutorId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar um pet' })
    @ApiOkResponse({ description: 'Dados do pet' })
    @ApiNotFoundResponse({ description: 'Pet não encontrado' })
    buscar(@Param('id', ParseUUIDPipe) id: string) {
        return this.petsService.buscarPorId(id);
    }

    @Post()
    @ApiOperation({ summary: 'Cadastrar pet' })
    @ApiCreatedResponse({ description: 'Pet cadastrado' })
    @ApiBadRequestResponse({ description: 'Dados inválidos' })
    @ApiNotFoundResponse({ description: 'Tutor não encontrado' })
    criar(@Body() dto: CriarPetDto) {
        return this.petsService.criar(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar pet' })
    @ApiOkResponse({ description: 'Pet atualizado' })
    @ApiNotFoundResponse({ description: 'Pet ou tutor não encontrado' })
    @ApiConflictResponse({ description: 'Troca de tutor com agendamentos vinculados' })
    atualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarPetDto) {
        return this.petsService.atualizar(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir pet' })
    @ApiNoContentResponse({ description: 'Pet excluído' })
    @ApiNotFoundResponse({ description: 'Pet não encontrado' })
    @ApiConflictResponse({ description: 'Pet com agendamentos vinculados' })
    remover(@Param('id', ParseUUIDPipe) id: string) {
        return this.petsService.remover(id);
    }
}
