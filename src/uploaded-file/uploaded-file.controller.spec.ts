import { Test, TestingModule } from '@nestjs/testing';
import { UploadedFileController } from './uploaded-file.controller';

describe('UploadedFileController', () => {
  let controller: UploadedFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadedFileController],
    }).compile();

    controller = module.get<UploadedFileController>(UploadedFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
