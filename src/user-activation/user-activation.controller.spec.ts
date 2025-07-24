import { Test, TestingModule } from '@nestjs/testing';
import { UserActivationController } from './user-activation.controller';

describe('UserActivationController', () => {
  let controller: UserActivationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserActivationController],
    }).compile();

    controller = module.get<UserActivationController>(UserActivationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
