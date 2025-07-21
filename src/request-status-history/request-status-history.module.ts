import { Module } from '@nestjs/common';
import { RequestStatusHistoryController } from './request-status-history.controller';
import { RequestStatusHistoryService } from './request-status-history.service';

@Module({
  controllers: [RequestStatusHistoryController],
  providers: [RequestStatusHistoryService]
})
export class RequestStatusHistoryModule {}
