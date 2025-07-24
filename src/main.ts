import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/loging.interceptor';

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
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
