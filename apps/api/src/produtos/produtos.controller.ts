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

import { ProdutosService } from './produtos.service';
import { AtualizarProdutoDto, CriarProdutoDto } from './dto/salvar-produto.dto';

@ApiTags('Produtos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado' })
@UseGuards(AuthGuard)
@Controller('produtos')
export class ProdutosController {
    constructor(private readonly produtosService: ProdutosService) {}

    @Get()
    @ApiOperation({ summary: 'Listar produtos' })
    @ApiOkResponse({ description: 'Lista de produtos' })
    listar() {
        return this.produtosService.listar();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar um produto' })
    @ApiOkResponse({ description: 'Dados do produto' })
    @ApiNotFoundResponse({ description: 'Produto não encontrado' })
    buscar(@Param('id', ParseUUIDPipe) id: string) {
        return this.produtosService.buscarPorId(id);
    }

    @Post()
    @ApiOperation({ summary: 'Cadastrar produto' })
    @ApiCreatedResponse({ description: 'Produto cadastrado' })
    @ApiBadRequestResponse({ description: 'Dados inválidos' })
    @ApiConflictResponse({ description: 'Já existe um produto com este nome' })
    criar(@Body() dto: CriarProdutoDto) {
        return this.produtosService.criar(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar produto' })
    @ApiOkResponse({ description: 'Produto atualizado' })
    @ApiNotFoundResponse({ description: 'Produto não encontrado' })
    @ApiConflictResponse({ description: 'Já existe um produto com este nome' })
    atualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarProdutoDto) {
        return this.produtosService.atualizar(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir produto' })
    @ApiNoContentResponse({ description: 'Produto excluído' })
    @ApiNotFoundResponse({ description: 'Produto não encontrado' })
    remover(@Param('id', ParseUUIDPipe) id: string) {
        return this.produtosService.remover(id);
    }
}
