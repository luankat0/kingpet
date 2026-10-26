import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'Maria Silva' })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @IsNotEmpty()
    nome!: string;

    @ApiProperty({ example: 'maria@email.com' })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEmail()
    @MaxLength(254)
    email!: string;

    @ApiProperty({
        example: '(81) 99999-9999',
        description: 'Telefone brasileiro com DDD',
    })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.replace(/\D/g, '') : value,
    )
    @IsString()
    @Matches(/^\d{10,11}$/, {
        message: 'Informe um telefone com DDD válido',
    })
    telefone!: string;

    @ApiPropertyOptional({
        example: 'Rua das Flores, 123 - Recife/PE',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    endereco?: string;

    @ApiProperty({
        example: 'MinhaSenha@2026',
        minLength: 12,
        maxLength: 72,
        writeOnly: true,
    })
    @IsString()
    @MinLength(12)
    @MaxLength(72)
    senha!: string;
}
