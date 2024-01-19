import { Test, TestingModule } from '@nestjs/testing';
import { AdressService } from './adress.service';
import { AdressController } from './adress.controller';
import { Adress } from './entities/adress.entity';
import { PrismaService } from '../prisma/prisma.service';

describe('AdressService', () => {
  let service: AdressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AdressService,
          useValue: {
            create: jest.fn().mockResolvedValue('This action adds a new address'),
          
          },
        },
      ],
    }).compile();

    service = module.get<AdressService>(AdressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('shoudl create a new address', async () => {
      // const result='This action adds a new address';
      expect(service.create).toEqual('This action adds a new address');
    });
  });
});
