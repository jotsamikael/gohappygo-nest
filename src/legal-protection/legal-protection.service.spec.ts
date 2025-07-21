import { Test, TestingModule } from '@nestjs/testing';
import { LegalProtectionService } from './legal-protection.service';

describe('LegalProtectionService', () => {
  let service: LegalProtectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegalProtectionService],
    }).compile();

    service = module.get<LegalProtectionService>(LegalProtectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
