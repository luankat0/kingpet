import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { StatusAgendamento } from '../../generated/prisma/enums';

export class ListarAgendamentosDto {
    @ApiPropertyOptional({
        enum: StatusAgendamento,
        description: 'Filtra os agendamentos por status',
    })
    @IsOptional()
    @IsEnum(StatusAgendamento)
    status?: StatusAgendamento;
}
