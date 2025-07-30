import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './message.entity';
import { UserModule } from 'src/user/user.module';
import { RequestModule } from 'src/request/request.module';

@Module({
  imports:[TypeOrmModule.forFeature([MessageEntity]), UserModule, RequestModule],
  controllers: [MessageController],
  providers: [MessageService]
})
export class MessageModule {}
