import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { STATUS_AGENDAMENTO } from '../../common/status-agendamento';
import type { StatusAgendamento } from '../../common/status-agendamento';

export class CriarAgendamentoDto {
    @ApiProperty({ description: 'Tutor responsável pelo atendimento' })
    @IsUUID()
    tutorId!: string;

    @ApiProperty({ description: 'Pet atendido; precisa ser do tutor informado' })
    @IsUUID()
    petId!: string;

    @ApiProperty({ description: 'Serviço que será prestado' })
    @IsUUID()
    servicoId!: string;

    @ApiProperty({
        example: '2026-12-10T14:30:00.000Z',
        description: 'Data e hora do atendimento (ISO 8601)',
    })
    @IsDateString({}, { message: 'Revise a data e a situação do agendamento.' })
    dataHora!: string;

    @ApiPropertyOptional({
        enum: STATUS_AGENDAMENTO,
        default: 'Agendado',
    })
    @IsOptional()
    @IsIn(STATUS_AGENDAMENTO, { message: 'Revise a data e a situação do agendamento.' })
    status?: StatusAgendamento;
}

export class AtualizarAgendamentoDto extends PartialType(CriarAgendamentoDto) {}
