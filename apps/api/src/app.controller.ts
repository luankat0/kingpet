import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';

@ApiTags('Status')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiOperation({ summary: 'Identificação da API' })
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('health')
    @ApiOperation({ summary: 'Checar API e conexão com o banco' })
    @ApiOkResponse({
        schema: {
            example: { status: 'ok', banco: 'ok', horario: '2026-11-26T12:00:00.000Z' },
        },
    })
    health() {
        return this.appService.health();
    }
}
