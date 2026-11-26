import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

const limpar = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;

export class CriarPetDto {
    @ApiProperty({ example: 'Amora' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    nome!: string;

    @ApiProperty({ example: 'Cão', description: 'Texto livre: Cão, Gato, Coelho, Ave...' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    especie!: string;

    @ApiProperty({ example: 'Shih-tzu' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    raca!: string;

    @ApiProperty({ example: 'Fêmea', description: 'Fêmea, Macho ou Não informado' })
    @Transform(limpar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    sexo!: string;

    @ApiProperty({ description: 'Id do tutor dono do pet' })
    @IsUUID()
    tutorId!: string;
}

export class AtualizarPetDto extends PartialType(CriarPetDto) {}
