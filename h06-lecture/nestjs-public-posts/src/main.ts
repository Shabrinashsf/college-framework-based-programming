import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Only the Next.js frontend may call this API from the browser.
  // Several origins can be given as a comma-separated list in FRONTEND_URL.
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // Strip / reject fields that are not declared in the DTO, so a client
      // cannot write columns like `id` or `createdAt` directly.
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      // Hand the converted DTO (e.g. authorId as a number) to the controller.
      transform: true,
      stopAtFirstError: false,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
