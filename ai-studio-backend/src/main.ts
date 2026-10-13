import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { Logger } from 'nestjs-pino';

import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

import { Request, Response, NextFunction } from 'express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    next();
  });

  // app.useLogger(app.get(Logger));

  const apiPrefix = process.env.API_PREFIX ?? 'api';
  const apiVersion = process.env.API_VERSION ?? 'v1';

  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map((origin) =>
      origin.trim(),
    ) ?? ['http://localhost:5173'],

    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      forbidNonWhitelisted: true,

      transform: true,

      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new RequestIdInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('LifeOS / AI Studio API')
    .setDescription('Production Agentic AI backend API for LifeOS / AI Studio.')
    .setVersion(apiVersion)
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(`${apiPrefix}/${apiVersion}/docs`, app, swaggerDocument);

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port);

  // const logger = app.get(Logger);

  // logger.log(
  //   `LifeOS backend started on http://localhost:${port}/${apiPrefix}/${apiVersion}`,
  // );
  app.useLogger(new Logger());
}

void bootstrap();
