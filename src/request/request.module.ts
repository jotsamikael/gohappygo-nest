import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { DemandModule } from 'src/demand/demand.module';
import { TravelModule } from 'src/travel/travel.module';
import { RequestStatusHistoryModule } from 'src/request-status-history/request-status-history.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  controllers: [RequestController],
  providers: [RequestService],
  imports:[TravelModule, DemandModule, RequestStatusHistoryModule, TransactionModule]
})
export class RequestModule {}
