import { Test, TestingModule } from '@nestjs/testing';
import { UserVerificationAuditController } from './user-verification-audit.controller';

describe('UserVerificationAuditController', () => {
  let controller: UserVerificationAuditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserVerificationAuditController],
    }).compile();

    controller = module.get<UserVerificationAuditController>(UserVerificationAuditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
