import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomBytes } from 'crypto'; // Correctly import randomBytes

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('BASIC API')
    .setDescription('BASIC API description')
    .setVersion('1.0')
    .addTag('BASIC APIS')
    .addBearerAuth(
      {
        description: 'Default JWT Authorization',
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'defaultBearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  // Use randomBytes correctly
  const randomUUIDkey = randomBytes(32).toString('hex'); // Specify 'hex' encoding
  console.log(randomUUIDkey);

  await app.listen(3024);
}

bootstrap();
