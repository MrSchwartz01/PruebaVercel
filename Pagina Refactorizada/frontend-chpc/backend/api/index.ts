import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

// Importar dinámicamente el módulo de la aplicación
const getAppModule = async () => {
  const { AppModule } = await import('../src/app.module');
  return AppModule;
};

const getFilters = async () => {
  const { HttpExceptionFilter } = await import('../src/common/filters/http-exception.filter');
  return { HttpExceptionFilter };
};

const getInterceptors = async () => {
  const { LoggingInterceptor } = await import('../src/common/interceptors/logging.interceptor');
  return { LoggingInterceptor };
};

const expressApp = express();

let cachedApp: INestApplication;

async function bootstrap(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const AppModule = await getAppModule();
  const { HttpExceptionFilter } = await getFilters();
  const { LoggingInterceptor } = await getInterceptors();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn', 'log'] }
  );

  // CORS
  const allowedOrigins = [
    'https://prueba-front-gules.vercel.app',
    'https://prueba-front-git-main-mrschwartz01s-projects.vercel.app',
    'http://localhost:8080',
    'http://localhost:3000',
  ];

  const envOrigins = process.env.CORS_ORIGIN;
  if (envOrigins) {
    envOrigins.split(',').forEach(origin => {
      const trimmed = origin.trim();
      if (trimmed && !allowedOrigins.includes(trimmed)) {
        allowedOrigins.push(trimmed);
      }
    });
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
  });

  app.setGlobalPrefix('api');

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

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.init();
  cachedApp = app;
  
  return app;
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  expressApp(req, res);
}
