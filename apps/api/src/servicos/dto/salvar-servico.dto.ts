import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

const limpar = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;

export class CriarServicoDto {
    @ApiProperty({ example: 'Banho' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    nome!: string;

    @ApiProperty({ example: 'Higienização e secagem da pelagem.' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    descricao!: string;

    @ApiProperty({ example: 65, description: 'Preço em reais' })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Informe um preço válido.' })
    @Min(0, { message: 'Informe um preço válido.' })
    @Max(99999999)
    preco!: number;
}

export class AtualizarServicoDto extends PartialType(CriarServicoDto) {}
