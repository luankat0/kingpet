import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CriarAgendamentoDto {
    @ApiProperty({
        example: 'b3f1c9d2-1f4a-4a6e-9c2b-0a1d2e3f4a5b',
        description: 'Id de um pet do tutor autenticado',
    })
    @IsUUID()
    petId!: string;

    @ApiProperty({ example: 'c4e2d0a3-2b5b-4b7f-8d3c-1b2e3f4a5b6c' })
    @IsUUID()
    servicoId!: string;

    @ApiProperty({
        example: '2026-12-10T14:30:00.000Z',
        description: 'Data e hora do atendimento (ISO 8601). Precisa ser no futuro.',
    })
    @IsDateString()
    dataHora!: string;

    @ApiPropertyOptional({ example: 'Buscar o pet em casa' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    observacoes?: string;
}
