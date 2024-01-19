import { Test, TestingModule } from '@nestjs/testing';
import { SheduledMailService } from './sheduled-mail.service';

describe('SheduledMailService', () => {
  let service: SheduledMailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SheduledMailService],
    }).compile();

    service = module.get<SheduledMailService>(SheduledMailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
