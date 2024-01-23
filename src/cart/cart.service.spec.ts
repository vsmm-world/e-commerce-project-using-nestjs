import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        {
          provide: CartService,
          useValue: {
            create: jest.fn().mockResolvedValue('This action adds a new cart'),
            findAll: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockResolvedValue([]),
            remove: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
