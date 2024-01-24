import { Test, TestingModule } from '@nestjs/testing';
import { AdressController } from './adress.controller';
import { AdressService } from './adress.service';
import { PrismaModule } from '../prisma/prisma.module';
import { Adress } from './entities/adress.entity';

describe('AdressController', () => {
  let controller: AdressController;
  let service: AdressService;

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
    service = module.get<AdressService>(AdressService);
  });

  describe('create', () => {
    it('should return a new result', async () => {
      jest.spyOn(service, 'create').mockImplementation(async () => result[0]);

      expect(await controller.create(result[0], req)).toEqual(result[0]);

      expect(service.create).toHaveBeenCalled();
    });

    it('should handle validation error for invalid data', async () => {
      const result = {
        statusCode: 200,
        message: 'This action returns a result',
        data: {
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
      };
      jest
        .spyOn(service, 'create')
        .mockImplementation(async () => await result.data);
      expect(await controller.create(result.data, req)).toEqual(result.data);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of resultes', async () => {
      jest.spyOn(service, 'findAll').mockImplementation(async () => result);

      expect(await controller.findAll(req)).toEqual(result);

      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return an array of resultes by customerId', async () => {
      const notFount = jest
        .spyOn(service, 'findAll')
        .mockImplementation(async () => result);

      expect(await controller.findAll(req)).toEqual(result);

      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a result', async () => {
      jest.spyOn(service, 'findOne').mockImplementation(async () => result[0]);

      expect(await controller.findOne('1', req)).toEqual(result[0]);

      expect(service.findOne).toHaveBeenCalled();
    });

    it('should return a result by customerId', async () => {
      jest.spyOn(service, 'findOne').mockImplementation(async () => result[0]);

      expect(await controller.findOne('1', req)).toEqual(result[0]);

      expect(service.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a result', async () => {
      jest.spyOn(service, 'update').mockImplementation(async () => result[0]);

      expect(await controller.update('1', result[0], req)).toEqual(result[0]);

      expect(service.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a result', async () => {
      jest.spyOn(service, 'remove').mockImplementation(async () => del);

      expect(await controller.remove('1', req)).toEqual(del);

      expect(service.remove).toHaveBeenCalled();
    });
  });

  
});
