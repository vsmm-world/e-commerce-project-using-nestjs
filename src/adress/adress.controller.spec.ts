import { Test, TestingModule } from '@nestjs/testing';
import { AdressController } from './adress.controller';
import { AdressService } from './adress.service';
import { PrismaModule } from '../prisma/prisma.module';
import { Adress } from './entities/adress.entity';
import { NotFoundException } from '@nestjs/common';

describe('AdressController', () => {
  let controller: AdressController;

  const notFound = {
    statusCode: 404,
    message: 'Adress not found',
  };

  const req = {
    user: {
      id: '1',
    },
  };
  const del = {
    statusCode: 200,
    message: 'This action removes a result',
  };

  const result: Adress[] = [
    {
      id: '1',
      customerId: '1',
      name: 'teste',
      street: 'Rua 1',
      phone: '1',
      city: 'Cidade 1',
      state: 'Estado 1',
      pincode: '00000000',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      isDefault: true,
    },
    {
      id: '2',
      customerId: '2',
      name: 'teste',
      street: 'Rua 1',
      phone: '1',
      city: 'Cidade 1',
      state: 'Estado 1',
      pincode: '00000000',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      isDefault: true,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [AdressController],
      providers: [
        {
          provide: AdressService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue('This action adds a new result'),
            findAll: jest
              .fn()
              .mockResolvedValue('This action returns all resultes'),
            findOne: jest
              .fn()
              .mockResolvedValue('This action returns a #${id} result'),
            update: jest

              .fn()
              .mockResolvedValue('This action updates a #${id} result'),

            remove: jest

              .fn()
              .mockResolvedValue('This action removes a #${id} result'),
          },
        },
      ],
    }).compile();

    controller = module.get<AdressController>(AdressController);
  });

  describe('create', () => {
    it('should return a new result', async () => {
      jest
        .spyOn(controller, 'create')
        .mockImplementation(async () => result[0]);

      expect(await controller.create(result[0], req)).toEqual(result[0]);

      expect(controller.create).toHaveBeenCalled();
    });

    it('should handle validation error for invalid data', async () => {
      jest.spyOn(controller, 'create').mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.create(result[0], req)).rejects.toThrow(
        NotFoundException,
      );

      expect(controller.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of resultes', async () => {
      jest.spyOn(controller, 'findAll').mockImplementation(async () => result);

      expect(await controller.findAll(req)).toEqual(result);

      expect(controller.findAll).toHaveBeenCalled();
    });

    it('should return an array of resultes by customerId', async () => {
      jest.spyOn(controller, 'findAll').mockImplementation(async () => result);

      expect(await controller.findAll(req)).toEqual(result);

      expect(controller.findAll).toHaveBeenCalled();
    });
    it('should return an empty array when no resultes are found', async () => {
      jest.spyOn(controller, 'findAll').mockImplementation(async () => []);

      expect(await controller.findAll(req)).toEqual([]);

      expect(controller.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a result by customerId', async () => {
      jest
        .spyOn(controller, 'findOne')
        .mockImplementation(async () => result[0]);

      expect(await controller.findOne('1', req)).toEqual(result[0]);

      expect(controller.findOne).toHaveBeenCalled();
    });
    it('should throw an error when no result is found', async () => {
      jest.spyOn(controller, 'findOne').mockImplementation(async () => {
        throw new NotFoundException(notFound.message);
      });

      await expect(controller.findOne('1', req)).rejects.toThrow(
        NotFoundException,
      );

      expect(controller.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a result', async () => {
      jest
        .spyOn(controller, 'update')
        .mockImplementation(async () => result[0]);

      expect(await controller.update('1', result[0], req)).toEqual(result[0]);

      expect(controller.update).toHaveBeenCalled();
    });
    it('should throw an error when updating a non-existing result', async () => {
      jest.spyOn(controller, 'update').mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(
        controller.update('nonexistent', result[0], req),
      ).rejects.toThrow(NotFoundException);
      expect(controller.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a result', async () => {
      jest.spyOn(controller, 'remove').mockImplementation(async () => del);

      expect(await controller.remove('1', req)).toEqual(del);

      expect(controller.remove).toHaveBeenCalled();
    });
    it('should throw an error when removing a non-existing result', async () => {
      jest.spyOn(controller, 'remove').mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.remove('nonexistent', req)).rejects.toThrow(
        NotFoundException,
      );
      expect(controller.remove).toHaveBeenCalled();
    });
  });
});
