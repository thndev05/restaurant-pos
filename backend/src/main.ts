import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const version: string = process.env.API_VERSION || 'v1';

  // Set global prefix for APIs
  app.setGlobalPrefix(version);

  // Validation pipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Tự động convert type
      },
    }),
  )

  // CORS
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
