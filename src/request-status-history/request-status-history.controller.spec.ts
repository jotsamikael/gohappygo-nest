import { Test, TestingModule } from '@nestjs/testing';
import { RequestStatusHistoryController } from './request-status-history.controller';

describe('RequestStatusHistoryController', () => {
  let controller: RequestStatusHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestStatusHistoryController],
    }).compile();

    controller = module.get<RequestStatusHistoryController>(RequestStatusHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
