import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  // Configuración de CORS
  const allowedOrigins = [
    'https://prueba-front-gules.vercel.app',
    'https://prueba-front-git-main-mrschwartz01s-projects.vercel.app',
    'https://prueba-front-r6mz49y40-mrschwartz01s-projects.vercel.app',
    'http://localhost:8080',
    'http://localhost:3000',
  ];
  
  // Agregar orígenes adicionales desde variable de entorno
  const envOrigins = process.env.CORS_ORIGIN;
  if (envOrigins) {
    envOrigins.split(',').forEach(origin => {
      const trimmed = origin.trim();
      if (trimmed && !allowedOrigins.includes(trimmed)) {
        allowedOrigins.push(trimmed);
      }
    });
  }

  console.log('🔒 CORS habilitado para:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
  });

  // Prefijo global de rutas
  app.setGlobalPrefix('api');

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Eliminar propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades extra
      transform: true, // Transformar tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtro global de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptor de logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('CHPC API')
    .setDescription('API de la tienda CHPC - Documentación completa de endpoints')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese su token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  return app;
};

// Para Vercel Serverless
let cachedServer: NestExpressApplication;

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const nestApp = await createNestServer(server);
    await nestApp.init();
    cachedServer = nestApp;
  }
  server(req, res);
}

// Para desarrollo local
async function bootstrap() {
  const app = await createNestServer(server);
  
  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`\n🚀 Servidor ejecutándose en:`);
  console.log(`   - Local: http://localhost:${port}`);
  console.log(`\n📚 API disponible en:`);
  console.log(`   - http://localhost:${port}/api`);
  console.log(`\n📖 Documentación Swagger:`);
  console.log(`   - http://localhost:${port}/api/docs\n`);
}

// Solo ejecutar bootstrap en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}
