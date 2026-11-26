import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const limpar = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;

export class RegisterDto {
    @ApiProperty({ example: 'Alex Martins' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    nome!: string;

    @ApiProperty({ example: 'equipe@kingpet.test' })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEmail()
    @MaxLength(254)
    email!: string;

    @ApiPropertyOptional({ example: 'Administração', default: 'Atendimento' })
    @IsOptional()
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    funcao?: string;

    @ApiProperty({ example: 'KingPet2026', minLength: 8, maxLength: 72, writeOnly: true })
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    senha!: string;
}
