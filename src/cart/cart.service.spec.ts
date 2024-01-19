import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[PrismaModule],
      providers: [CartService],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
