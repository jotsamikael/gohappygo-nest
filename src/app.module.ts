import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    //file upload
    ConfigModule.forRoot({
      isGlobal: true,
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
    //Orm
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'gohappygo',
      entities: [ UserEntity, UserRoleEntity, AirportEntity,
        DemandEntity, RequestEntity,
        TravelEntity, TransactionEntity,
        RequestStatusEntity, RequestStatusHistoryEntity,
        ReviewEntity, DeliveyProofEntity,
        InsuranceEntity, MessageEntity,
        LegalProtectionEntity,UserActivationEntity,
        UploadedFileEntity,UserVerificationAuditEntity,
         File], //array of entities that you want to register
      synchronize: true, //dev mode
    }),

    ConfigModule.forRoot({
      isGlobal:true, //makes configmodule globally available
      /* validationSchema: joi.object({
        APP_NAME: joi.string().default('defaultApp'),
      }) */
     load:[appConfig]
    })
    , UserModule, AuthModule,UserVerificationAuditModule, FileUploadModule, EventsModule, DemandModule, TravelModule, RequestModule, RoleModule, ReviewModule, TransactionModule, RequestStatusModule, RequestStatusHistoryModule, DeliveryProofModule, InsuranceModule, LegalProtectionModule, MessageModule, UserActivationModule, UploadedFileModule, UserVerificationAuditModule, AirportModule],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
   // Apply middleware for all routes
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
  
}
