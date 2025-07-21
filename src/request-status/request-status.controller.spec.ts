import { Test, TestingModule } from '@nestjs/testing';
import { RequestStatusController } from './request-status.controller';

describe('RequestStatusController', () => {
  let controller: RequestStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestStatusController],
    }).compile();

    controller = module.get<RequestStatusController>(RequestStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
