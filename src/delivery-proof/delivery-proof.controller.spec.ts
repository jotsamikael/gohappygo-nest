import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryProofController } from './delivery-proof.controller';

describe('DeliveryProofController', () => {
  let controller: DeliveryProofController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryProofController],
    }).compile();

    controller = module.get<DeliveryProofController>(DeliveryProofController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
