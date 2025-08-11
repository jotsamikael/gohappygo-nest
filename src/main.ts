import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/loging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

//root file ->entry point of nest js application

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, {
    logger:['error', 'warn','log','debug','verbose']
  });
  
  //validate incoming request bodies automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //strips propoerties that don't have decorators
      forbidNonWhitelisted: true,
      transform: true,//automatically transforms payloads to be objects typed according to their classes
      disableErrorMessages: false
    })
  );
  app.useGlobalInterceptors(
    new LoggingInterceptor()
  )

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('GoHappyGo API')
    .setDescription('API documentation for GoHappyGo platform - connecting travelers and package senders for collaborative deliveries')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('demands', 'Delivery demand endpoints')
    .addTag('travels', 'Travel declaration endpoints')
    .addTag('requests', 'Request matching endpoints')
    .addTag('reviews', 'Review system endpoints')
    .addTag('messages', 'Messaging endpoints')
    .addTag('transactions', 'Payment transaction endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for references
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
