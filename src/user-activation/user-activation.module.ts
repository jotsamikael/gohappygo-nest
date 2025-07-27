import { Module } from '@nestjs/common';
import { UserActivationController } from './user-activation.controller';
import { UserActivationService } from './user-activation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivationEntity } from './user-activation.entity';

@Module({
   imports:[
              //Makes UserActivationEntity available for injection
              TypeOrmModule.forFeature([UserActivationEntity])
        ],
  controllers: [UserActivationController],
  providers: [UserActivationService],
    exports: [UserActivationService]

})
export class UserActivationModule {}
