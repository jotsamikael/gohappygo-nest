import { Test, TestingModule } from '@nestjs/testing';
import { UserVerificationAuditService } from './user-verification-audit.service';

describe('UserVerificationAuditEntityService', () => {
  let service: UserVerificationAuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserVerificationAuditService],
    }).compile();

    service = module.get<UserVerificationAuditService>(UserVerificationAuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
