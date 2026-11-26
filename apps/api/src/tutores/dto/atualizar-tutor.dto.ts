import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AtualizarTutorDto {
    @ApiPropertyOptional({ example: 'Maria Silva' })
    @IsOptional()
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    nome?: string;

    @ApiPropertyOptional({
        example: '(81) 99999-9999',
        description: 'Telefone brasileiro com DDD',
    })
    @IsOptional()
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.replace(/\D/g, '') : value,
    )
    @IsString()
    @Matches(/^\d{10,11}$/, {
        message: 'Informe um telefone com DDD válido',
    })
    telefone?: string;

    @ApiPropertyOptional({ example: 'Rua das Flores, 123 - Recife/PE' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    endereco?: string;
}
