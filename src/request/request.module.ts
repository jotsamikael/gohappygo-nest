import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { DemandModule } from 'src/demand/demand.module';
import { TravelModule } from 'src/travel/travel.module';
import { RequestStatusHistoryModule } from 'src/request-status-history/request-status-history.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestEntity } from './request.entity';
import { RequestStatusModule } from 'src/request-status/request-status.module';

@Module({
  controllers: [RequestController],
  providers: [RequestService],
  imports:[
        TypeOrmModule.forFeature([RequestEntity])
    ,TravelModule, DemandModule, RequestStatusModule, RequestStatusHistoryModule, TransactionModule],
  exports:[RequestService]
})
export class RequestModule {}
