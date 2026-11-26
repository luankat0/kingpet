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
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator';

import { PetsService } from './pets.service';
import { CriarPetDto } from './dto/criar-pet.dto';
import { AtualizarPetDto } from './dto/atualizar-pet.dto';

@ApiTags('Pets')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado' })
@UseGuards(AuthGuard)
@Controller('pets')
export class PetsController {
    constructor(private readonly petsService: PetsService) {}

    @Post()
    @ApiOperation({ summary: 'Cadastrar um pet para o tutor autenticado' })
    @ApiCreatedResponse({ description: 'Pet cadastrado' })
    @ApiBadRequestResponse({ description: 'Dados inválidos' })
    criar(@UsuarioAtual() usuarioId: string, @Body() dto: CriarPetDto) {
        return this.petsService.criar(usuarioId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar os pets do tutor autenticado' })
    @ApiOkResponse({ description: 'Lista de pets' })
    listar(@UsuarioAtual() usuarioId: string) {
        return this.petsService.listar(usuarioId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar um pet do tutor autenticado' })
    @ApiOkResponse({ description: 'Dados do pet' })
    @ApiNotFoundResponse({ description: 'Pet não encontrado' })
    buscar(@UsuarioAtual() usuarioId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.petsService.buscarPorId(usuarioId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar um pet do tutor autenticado' })
    @ApiOkResponse({ description: 'Pet atualizado' })
    @ApiNotFoundResponse({ description: 'Pet não encontrado' })
    atualizar(
        @UsuarioAtual() usuarioId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AtualizarPetDto,
    ) {
        return this.petsService.atualizar(usuarioId, id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir um pet do tutor autenticado' })
    @ApiNoContentResponse({ description: 'Pet excluído' })
    @ApiNotFoundResponse({ description: 'Pet não encontrado' })
    remover(@UsuarioAtual() usuarioId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.petsService.remover(usuarioId, id);
    }
}
