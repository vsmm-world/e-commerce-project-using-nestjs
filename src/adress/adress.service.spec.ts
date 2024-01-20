import { Test, TestingModule } from '@nestjs/testing';
import { AdressService } from './adress.service';
import { AdressController } from './adress.controller';
import { Adress } from './entities/adress.entity';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('AdressService', () => {
  let service: AdressService;

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
          },
        },
      ],
    }).compile();

    service = module.get<AdressService>(AdressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('create', () => {
  //   it('should create a new address', async () => {
  //     const address = new Adress();
  //     address.id = 1;
  //     address.name = 'teste';
  //     address.street = 'Rua 1';
  //     address.phone = '1';
  //     address.city = 'Cidade 1';
  //     address.state = 'Estado 1';
  //     address.pincode = '00000000';
  //     address.isDefault = true;
  //     const x = 'teste';
  //     expect(await service.create(address, x)).toEqual({
  //       id: 1,
  //       name: 'teste',
  //       street: 'Rua 1',
  //       phone: '1',
  //       city: 'Cidade 1',
  //       state: 'Estado 1',
  //       pincode: '00000000',
  //       isDefault: true,
  //     });
  //   });
  // });
});
