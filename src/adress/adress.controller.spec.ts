import { Test, TestingModule } from '@nestjs/testing';
import { AdressController } from './adress.controller';
import { AdressService } from './adress.service';
import { Controller } from '@nestjs/common';

describe('AdressController', () => {
  let controller: AdressController;

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new address', async () => {
      const result = 'This action adds a new address';
      expect(result).toEqual('This action adds a new address');
    });
  });

  describe('findAll', () => {
    it('should return an array of addresses', async () => {
      const result = 'This action returns all addresses';
      expect(result).toEqual('This action returns all addresses');
    });
  });

  describe('findOne', () => {
    it('should return a single address', async () => {
      const result = 'This action returns a #${id} address';
      expect(result).toEqual('This action returns a #${id} address');
    });
  });

  describe('update', () => {
    it('should update a address', async () => {
      const result = 'This action updates a #${id} address';
      expect(controller.update).toEqual('This action updates a #${id} address');
    });
  });

  describe('remove', () => {
    it('should remove a address', async () => {
      const result = 'This action removes a #${id} address';
      expect(result).toEqual('This action removes a #${id} address');
    });
  });
});
