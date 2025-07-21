import { Test, TestingModule } from '@nestjs/testing';
import { LegalProtectionController } from './legal-protection.controller';

describe('LegalProtectionController', () => {
  let controller: LegalProtectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalProtectionController],
    }).compile();

    controller = module.get<LegalProtectionController>(LegalProtectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
