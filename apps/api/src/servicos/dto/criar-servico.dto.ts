import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CriarServicoDto {
    @ApiProperty({ example: 'Banho e tosa' })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    nome!: string;

    @ApiPropertyOptional({ example: 'Banho completo com tosa higiênica' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    descricao?: string;

    @ApiProperty({ example: 89.9, description: 'Preço em reais' })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(99999999)
    preco!: number;

    @ApiProperty({ example: 60, description: 'Duração estimada em minutos' })
    @Type(() => Number)
    @IsInt()
    @Min(5)
    @Max(600)
    duracaoMinutos!: number;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    ativo?: boolean;
}
