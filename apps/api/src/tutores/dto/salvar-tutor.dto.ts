import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

const limpar = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;

export class CriarTutorDto {
    @ApiProperty({ example: 'Ana Ribeiro' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    nome!: string;

    @ApiProperty({ example: 'ana@email.com', description: 'E-mail ou outro contato do tutor' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(254)
    contato!: string;

    @ApiProperty({
        example: '(81) 99999-9999',
        description: 'Telefone com DDD. O texto é guardado como veio da tela.',
    })
    @Transform(limpar)
    @IsString()
    @Matches(/^\D*(\d\D*){10,11}$/, {
        message: 'Informe um telefone válido com DDD',
    })
    @MaxLength(20)
    telefone!: string;

    @ApiProperty({ example: 'Rua das Acácias, 10 — Recife, PE' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    endereco!: string;
}

export class AtualizarTutorDto extends PartialType(CriarTutorDto) {}
