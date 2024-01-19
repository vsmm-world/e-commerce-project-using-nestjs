import { Test, TestingModule } from '@nestjs/testing';
import { SheduledMailService } from './sheduled-mail.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('SheduledMailService', () => {
  let service: SheduledMailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      
      imports:[PrismaModule],
      providers: [SheduledMailService],
    }).compile();

    service = module.get<SheduledMailService>(SheduledMailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
