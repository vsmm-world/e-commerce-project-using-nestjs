import { Test, TestingModule } from '@nestjs/testing';
import { SheduledMailController } from './sheduled-mail.controller';
import { SheduledMailService } from './sheduled-mail.service';

describe('SheduledMailController', () => {
  let controller: SheduledMailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SheduledMailController],
      providers: [SheduledMailService],
    }).compile();

    controller = module.get<SheduledMailController>(SheduledMailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
