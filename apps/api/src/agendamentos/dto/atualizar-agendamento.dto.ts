import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AtualizarAgendamentoDto {
    @ApiPropertyOptional({ description: 'Trocar o serviço do atendimento' })
    @IsOptional()
    @IsUUID()
    servicoId?: string;

    @ApiPropertyOptional({
        example: '2026-12-11T09:00:00.000Z',
        description: 'Nova data e hora (ISO 8601). Precisa ser no futuro.',
    })
    @IsOptional()
    @IsDateString()
    dataHora?: string;

    @ApiPropertyOptional({ example: 'Cliente pediu para adiantar' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    observacoes?: string;
}
