import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

const limpar = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;

export class CriarProdutoDto {
    @ApiProperty({ example: 'Ração para gatos' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    nome!: string;

    @ApiProperty({ example: 'Pacote de 1 kg para gatos adultos.' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    descricao!: string;

    @ApiProperty({ example: 42.9, description: 'Preço em reais' })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Informe um preço válido.' })
    @Min(0, { message: 'Informe um preço válido.' })
    @Max(99999999)
    preco!: number;

    @ApiProperty({ example: 3, description: 'Quantidade em estoque' })
    @Type(() => Number)
    @IsInt({ message: 'O estoque deve ser um inteiro positivo ou zero.' })
    @Min(0, { message: 'O estoque deve ser um inteiro positivo ou zero.' })
    @Max(1000000)
    estoque!: number;
}

export class AtualizarProdutoDto extends PartialType(CriarProdutoDto) {}
