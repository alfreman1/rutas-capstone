import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './shared/presentation/filters/global-exception.filter';
import { TransformInterceptor } from './shared/presentation/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Prefix
  app.setGlobalPrefix('api/v1');

  // Security
  app.use(helmet());
  app.enableCors();

  // Pipes & Filters & Interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Logistics AI API')
    .setDescription('Backend NestJS para el sistema de logística con IA')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`Swagger docs at: http://localhost:${port}/api/docs`);
}
bootstrap();
