import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListarServicosDto {
    @ApiPropertyOptional({
        example: true,
        description: 'Quando informado, filtra os serviços pelo status. Padrão: somente ativos.',
    })
    @IsOptional()
    @Transform(({ value }: { value: unknown }) => {
        if (value === 'true' || value === true) {
            return true;
        }

        if (value === 'false' || value === false) {
            return false;
        }

        return value;
    })
    @IsBoolean()
    ativo?: boolean;
}
