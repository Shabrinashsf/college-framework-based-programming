import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initApp } from './app.init';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  initApp(app);     // shared with tests, so tests run with the same config as production

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();