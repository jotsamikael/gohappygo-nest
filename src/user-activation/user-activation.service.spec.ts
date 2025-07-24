import { Test, TestingModule } from '@nestjs/testing';
import { UserActivationService } from './user-activation.service';

describe('UserActivationService', () => {
  let service: UserActivationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserActivationService],
    }).compile();

    service = module.get<UserActivationService>(UserActivationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
