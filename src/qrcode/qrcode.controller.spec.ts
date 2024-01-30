import { Test, TestingModule } from '@nestjs/testing';
import { QrCodeController } from './qrcode.controller';
import { QrCodeService } from './qrcode.service';

describe('QrcodeController', () => {
  let controller: QrCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodeController],
      providers: [QrCodeService],
    }).compile();

    controller = module.get<QrCodeController>(QrCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
