import { Test, TestingModule } from '@nestjs/testing';
import { RequestStatusService } from './request-status.service';

describe('RequestStatusService', () => {
  let service: RequestStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestStatusService],
    }).compile();

    service = module.get<RequestStatusService>(RequestStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
