import { Test, TestingModule } from '@nestjs/testing';
import { AdressController } from './adress.controller';
import { AdressService } from './adress.service';
import { Controller } from '@nestjs/common';

describe('AdressController', () => {
  let controller: AdressController;
  let service: AdressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdressController],
      providers: [
        {
          provide: AdressService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue('This action adds a new address'),
            findAll: jest
              .fn()
              .mockResolvedValue('This action returns all addresses'),
            findOne: jest
              .fn()
              .mockResolvedValue('This action returns a #${id} address'),
            update: jest

              .fn()
              .mockResolvedValue('This action updates a #${id} address'),

            remove: jest

              .fn()
              .mockResolvedValue('This action removes a #${id} address'),
          },
        },
      ],
    }).compile();

    controller = module.get<AdressController>(AdressController);
    service = module.get<AdressService>(AdressService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('shoudl create a new address', async () => {
      expect(await controller.create(null, null)).toEqual(
        'This action adds a new address',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of addresses', async () => {
      expect(await controller.findAll(null)).toEqual(
        'This action returns all addresses',
      );
    });
  });
  
});
