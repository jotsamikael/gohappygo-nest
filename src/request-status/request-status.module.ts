import { Module } from '@nestjs/common';
import { RequestStatusController } from './request-status.controller';
import { RequestStatusService } from './request-status.service';

@Module({
  controllers: [RequestStatusController],
  providers: [RequestStatusService]
})
export class RequestStatusModule {}
