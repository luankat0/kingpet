import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                AppService,
                {
                    provide: PrismaService,
                    useValue: { $queryRaw: jest.fn().mockResolvedValue([{ '1': 1 }]) },
                },
            ],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    describe('root', () => {
        it('deve identificar a API', () => {
            expect(appController.getHello()).toBe('King Pet API');
        });
    });

    describe('health', () => {
        it('deve responder ok quando o banco responde', async () => {
            await expect(appController.health()).resolves.toMatchObject({
                status: 'ok',
                banco: 'ok',
            });
        });
    });
});
