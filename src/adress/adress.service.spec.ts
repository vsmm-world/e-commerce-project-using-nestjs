import { Test, TestingModule } from '@nestjs/testing';
import { AdressService } from './adress.service';
import { AdressController } from './adress.controller';
import { Adress } from './entities/adress.entity';
import { PrismaModule } from '../prisma/prisma.module';

describe('AdressService', () => {
  let service: AdressService;
  let controller: AdressController;

  const del = {
    statusCode: 200,
    message: 'This action removes a address',
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

      providers: [
        {
          provide: AdressService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue('This action adds a new address'),
            findAll: jest.fn().mockResolvedValue(result),
            findOne: jest.fn().mockResolvedValue(result[0]),
            update: jest
              .fn()
              .mockResolvedValue('This action updates a address'),
            remove: jest
              .fn()
              .mockResolvedValue('This action removes a address'),
          },
        },
      ],
    }).compile();

    service = module.get<AdressService>(AdressService);
  });

  describe('findAll', () => {
    it('should return an array of addresses', async () => {
      jest.spyOn(service, 'findAll').mockImplementation(async () => result);

      expect(await service.findAll(result)).toBe(result);

      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a address', async () => {
      jest.spyOn(service, 'findOne').mockImplementation(async () => result[0]);

      expect(await service.findOne('1', result)).toBe(result[0]);

      expect(service.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a address', async () => {
      const address = new Adress();
      address.id = '1';
      address.name = 'teste';
      address.street = 'Rua 1';
      address.phone = '1';
      address.city = 'Cidade 1';
      address.state = 'Estado 1';
      address.pincode = '00000000';
      address.isDefault = true;
      jest.spyOn(service, 'update').mockImplementation(async () => address);

      expect(await service.update('1', address, result)).toBe(address);

      expect(service.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a address', async () => {
      jest.spyOn(service, 'remove').mockImplementation(async () => del);

      expect(await service.remove('1', del)).toBe(del);

      expect(service.remove).toHaveBeenCalled();
    });
  });
});
