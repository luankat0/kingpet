import { Transform } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Especie, Porte } from '../../generated/prisma/enums';

export class CriarPetDto {
    @ApiProperty({ example: 'Rex' })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    nome!: string;

    @ApiProperty({ enum: Especie, example: Especie.CACHORRO })
    @IsEnum(Especie)
    especie!: Especie;

    @ApiPropertyOptional({ example: 'Golden Retriever' })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    raca?: string;

    @ApiPropertyOptional({ enum: Porte, example: Porte.GRANDE })
    @IsOptional()
    @IsEnum(Porte)
    porte?: Porte;

    @ApiPropertyOptional({
        example: '2022-05-10',
        description: 'Data de nascimento no formato ISO (AAAA-MM-DD)',
    })
    @IsOptional()
    @IsDateString()
    dataNascimento?: string;

    @ApiPropertyOptional({ example: 'Alérgico a shampoo com perfume' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    observacoes?: string;
}
