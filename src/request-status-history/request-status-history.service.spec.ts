import { Test, TestingModule } from '@nestjs/testing';
import { RequestStatusHistoryService } from './request-status-history.service';

describe('RequestStatusHistoryService', () => {
  let service: RequestStatusHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestStatusHistoryService],
    }).compile();

    service = module.get<RequestStatusHistoryService>(RequestStatusHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
