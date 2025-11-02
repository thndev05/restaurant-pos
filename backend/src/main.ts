import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const version: string = process.env.API_VERSION || 'v1';

  // Set global prefix for APIs
  app.setGlobalPrefix(version);

  // CORS
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
