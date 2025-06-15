import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CORS } from './constant/cors';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        if (req.originalUrl.includes('/webhooks/stripe')) {
          req.rawBody = buf;
        }
      },
      limit: '10mb',
    })
  );

  app.enableCors(CORS);
  await app.listen(port, () => {
    console.log(`Server on port ${port}`)
  });
}
bootstrap();
