import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/loging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MessageEntity } from './message/message.entity';
import { RequestEntity } from './request/request.entity';
import { ReviewEntity } from './review/review.entity';
import { TransactionEntity } from './transaction/transaction.entity';
import { TravelEntity } from './travel/travel.entity';
import { UserEntity } from './user/user.entity';
import { AirlineEntity } from './airline/entities/airline.entity';

//root file ->entry point of nest js application

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, {
    logger:['error', 'warn','log','debug','verbose']
  });
  
  // Get ConfigService instance
  const configService = app.get(ConfigService);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:4200', // Angular development server
      'http://localhost:3000', // Backend server
      'http://127.0.0.1:4200', // Alternative localhost
      'http://127.0.0.1:3000', // Alternative backend
      // Add your production domain here when deploying
      // 'https://yourdomain.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
    ],
    credentials: true, // Allow cookies and authentication headers
    preflightContinue: false,
    optionsSuccessStatus: 204,
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

  // Get the base URL from environment or use default
  const baseUrl = configService.get<string>('BASE_URL') || 'http://localhost:3000';

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('GoHappyGo API')
    .setDescription('API documentation for GoHappyGo platform - connecting travelers and package senders for collaborative deliveries')
    .setVersion('1.0')
    .addServer(baseUrl, 'Development server') // Add the server URL
    .addServer('https://your-production-domain.com', 'Production server') // Add production server
    .addTag('auth', 'Authentication endpoints')
    .addTag('airlines', 'Airline management endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('demands', 'Delivery demand endpoints')
    .addTag('demandsAndTravels', 'Demands and travels search endpoints')
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
  
  const document = SwaggerModule.createDocument(app, config,{
    extraModels: [UserEntity, AirlineEntity, TravelEntity, RequestEntity, ReviewEntity, MessageEntity, TransactionEntity], //add entities to swagger
  });
  
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      // Set the default server
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      // You can also set the default server here
      url: `${baseUrl}/api-json`, // This will be the default URL for the OpenAPI spec
    },
  });

  // Use ConfigService to get PORT
  const port = configService.get<number>('PORT') || 3000;
  
  // Listen on all network interfaces (important for Render)
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: ${baseUrl}`);
  logger.log(`Swagger documentation available at: ${baseUrl}/api`);
}
bootstrap();
