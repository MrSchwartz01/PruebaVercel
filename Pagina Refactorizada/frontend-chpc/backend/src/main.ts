import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    origin: (origin, callback) => {
      // Permitir requests sin origin (como mobile apps o Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS bloqueado para origen: ${origin}`);
        callback(null, true); // Temporalmente permitir todos para debug
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
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

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0'); // Escuchar en todas las interfaces de red
  
  // Obtener la IP local
  const networkInterfaces = require('os').networkInterfaces();
  const localIP = Object.values(networkInterfaces)
    .flat()
    .filter((iface): iface is { family: string; internal: boolean; address: string } => 
      iface !== null && iface !== undefined
    )
    .find((iface) => iface.family === 'IPv4' && !iface.internal)?.address || 'localhost';
  
  console.log(`\n🚀 Servidor ejecutándose en:`);
  console.log(`   - Local: http://localhost:${port}`);
  console.log(`   - Red Local: http://${localIP}:${port}`);
  console.log(`\n📚 API disponible en:`);
  console.log(`   - Local: http://localhost:${port}/api`);
  console.log(`   - Red Local: http://${localIP}:${port}/api`);
  console.log(`\n📖 Documentación Swagger:`);
  console.log(`   - http://${localIP}:${port}/api/docs`);
  console.log(`\n🔐 Endpoints de autenticación:`);
  console.log(`   - POST http://${localIP}:${port}/api/auth/registro`);
  console.log(`   - POST http://${localIP}:${port}/api/auth/login`);
  console.log(`   - POST http://${localIP}:${port}/api/auth/refresh`);
  console.log(`   - GET  http://${localIP}:${port}/api/auth/verificar\n`);
}
bootstrap();
