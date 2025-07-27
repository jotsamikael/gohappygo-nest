import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Passport } from 'passport';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles-guard';
import { EventsModule } from 'src/events/events.module';
import { UserService } from 'src/user/user.service';
import { UserActivationService } from 'src/user-activation/user-activation.service';
import { RoleService } from 'src/role/role.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { UserVerificationAuditService } from 'src/user-verification-audit-entity/user-verification-audit.service';
import { UserModule } from 'src/user/user.module';
import { UserActivationModule } from 'src/user-activation/user-activation.module';
import { RoleModule } from 'src/role/role.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { UserVerificationAuditModule } from 'src/user-verification-audit-entity/user-verification-audit.module';

@Module({
  imports:[
    //events module
    EventsModule,

    //this will make the post repository available in the current scope
    TypeOrmModule.forFeature([UserEntity]),

    //passport module
    PassportModule,

    //configure jwt
    JwtModule.register({}),
    UserModule,
    UserActivationModule,
    RoleModule,
    FileUploadModule,
    UserVerificationAuditModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard], //jwt strategy, roles guard
  exports: [AuthService] //role -> guard
})
export class AuthModule {}
