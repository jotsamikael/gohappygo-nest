import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneVerificationEntity } from './phone-verification.entity';
import { PhoneVerificationService } from './phone-verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneVerificationEntity])],
  providers: [PhoneVerificationService],
  exports: [PhoneVerificationService],
})
export class PhoneVerificationModule {}
