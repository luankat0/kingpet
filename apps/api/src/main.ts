import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: process.env.WEB_ORIGIN ?? 'http://localhost:4200',
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const swaggerConfig = new DocumentBuilder()
        .setTitle('King Pet API')
        .setDescription('API REST do sistema King Pet')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('docs', app, document);

    const port = Number(process.env.PORT ?? 3000);

    await app.listen(port);
}

void bootstrap();
