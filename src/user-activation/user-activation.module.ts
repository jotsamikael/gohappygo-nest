import { Module } from '@nestjs/common';
import { UserActivationController } from './user-activation.controller';
import { UserActivationService } from './user-activation.service';

@Module({
  controllers: [UserActivationController],
  providers: [UserActivationService]
})
export class UserActivationModule {}
