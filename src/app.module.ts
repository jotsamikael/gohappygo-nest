import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi'
import appConfig from './config/appConfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './user/user.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { FileUploadModule } from './file-upload/file-upload.module';
import { File } from './file-upload/entities/file.entity';
import { EventsModule } from './events/events.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { DemandModule } from './demand/demand.module';
import { TravelModule } from './travel/travel.module';
import { RequestModule } from './request/request.module';
import { RoleModule } from './role/role.module';
import { ReviewModule } from './review/review.module';
import { TransactionModule } from './transaction/transaction.module';
import { RequestStatusModule } from './request-status/request-status.module';
import { RequestStatusHistoryModule } from './request-status-history/request-status-history.module';
import { DeliveryProofModule } from './delivery-proof/delivery-proof.module';
import { InsuranceModule } from './insurance/insurance.module';
import { LegalProtectionModule } from './legal-protection/legal-protection.module';
import { MessageModule } from './message/message.module';
import { UserRoleEntity } from './role/userRole.entity';
import { DemandEntity } from './demand/demand.entity';
import { RequestEntity } from './request/request.entity';
import { TravelEntity } from './travel/travel.entity';
import { TransactionEntity } from './transaction/transaction.entity';
import { RequestStatusEntity } from './request-status/requestStatus.entity';
import { RequestStatusHistoryEntity } from './request-status-history/RequestStatusHistory.entity';
import {DeliveyProofEntity } from './delivery-proof/delivery-proof.entity';
import { InsuranceEntity } from './insurance/insurance.entity';
import { MessageEntity } from './message/message.entity';
import { LegalProtectionEntity } from './legal-protection/legal-protection.entity';
import { UserActivationModule } from './user-activation/user-activation.module';
import { UploadedFileModule } from './uploaded-file/uploaded-file.module';
import { UserActivationEntity } from './user-activation/user-activation.entity';
import { UploadedFileEntity } from './uploaded-file/uploaded-file.entity';
import { UserVerificationAuditModule } from './user-verification-audit-entity/user-verification-audit.module';
import { ReviewEntity } from './review/review.entity';
import { UserVerificationAuditEntity } from './user-verification-audit-entity/user-verification-audit.entity';
import { AirportModule } from './airport/airport.module';
import { AirportEntity } from './airport/entities/airport.entity';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    EmailModule,
    // Configuration Module - Load first
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        DB_HOST: joi.string().default('localhost'),
        DB_PORT: joi.number().default(3306),
        DB_USERNAME: joi.string().required(),
        DB_PASSWORD: joi.string().allow('').default(''),
        DB_DATABASE: joi.string().required(),
        PORT: joi.number().default(3000),
        NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
      }),
      load: [appConfig]
    }),
    //Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 30000,
      max: 100
    }),
    //Rate limiting
    ThrottlerModule.forRoot([
      {ttl: 60000,
        limit:5
      }
    ]),
    //ORM - Use ConfigService to get environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [ 
          UserEntity, UserRoleEntity, AirportEntity,
          DemandEntity, RequestEntity,
          TravelEntity, TransactionEntity,
          RequestStatusEntity, RequestStatusHistoryEntity,
          ReviewEntity, DeliveyProofEntity,
          InsuranceEntity, MessageEntity,
          LegalProtectionEntity, UserActivationEntity,
          UploadedFileEntity, UserVerificationAuditEntity,
          File
        ],
        synchronize: configService.get<string>('NODE_ENV') === 'development', // Only in dev mode
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    UserModule, AuthModule, UserVerificationAuditModule, FileUploadModule, EventsModule, DemandModule, TravelModule, RequestModule, RoleModule, ReviewModule, TransactionModule, RequestStatusModule, RequestStatusHistoryModule, DeliveryProofModule, InsuranceModule, LegalProtectionModule, MessageModule, UserActivationModule, UploadedFileModule, UserVerificationAuditModule, AirportModule, EmailModule
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
   // Apply middleware for all routes
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
