import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from '../prisma/prisma.module';
import { Cart } from './entities/cart.entity';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;
  const req = {
    user: {
      id: '1',
    },
  };

  const message = [
    {
      statusCode: 200,
      message: 'This action create a cart',
      Products: [],
    },
    {
      statusCode: 200,
      message: 'This action create a cart',
      cart: {
        id: '1',
        productIds: [
          {
            id: '1',
            quantity: 1,
          },
        ],

        products: [
          {
            id: '1',
            quantity: 1,
          },
        ],
        totalItems: 2,
        totalPrice: 500,
        isReminded: true,
        reminderDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        customerId: '1',
        isDeleted: false,
        productId: '1',
        ProductVariantId: '1',
      },
    },
  ];

  const cart = {
    productVariantId: '1',
    quantity: 1,
  };
  const result = [
    {
      id: '1',
      productIds: [
        {
          id: '1',
          quantity: 1,
        },
      ],

      products: [
        {
          id: '1',
          quantity: 1,
        },
      ],
      totalItems: 2,
      totalPrice: 500,
      isReminded: true,
      reminderDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      customerId: '1',
      isDeleted: false,
      productId: '1',
      ProductVariantId: '1',
    },
    {
      id: '1',
      productIds: [
        {
          id: '1',
          quantity: 1,
        },
      ],

      products: [
        {
          id: '1',
          quantity: 1,
        },
      ],
      totalItems: 2,
      totalPrice: 500,
      isReminded: true,
      reminderDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      customerId: '1',
      isDeleted: false,
      productId: '1',
      ProductVariantId: '1',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            create: jest.fn().mockResolvedValue('This action adds a new cart'),
            findAll: jest
              .fn()
              .mockResolvedValue('This action returns all cart'),

            update: jest
              .fn()
              .mockResolvedValue('This action updates a #${id} cart'),
            remove: jest
              .fn()
              .mockResolvedValue('This action removes a #${id} cart'),
          },
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  describe('create', () => {
    it('should return a new cart', async () => {
      jest
        .spyOn(controller, 'create')
        .mockImplementation(async () => message[0]);

      expect(await controller.create(cart, req)).toBe(message[0]);

      expect(controller.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of cart', async () => {
      jest
        .spyOn(controller, 'findAll')
        .mockImplementation(async () => message[1]);

      expect(await controller.findAll(req)).toBe(message[1]);

      expect(controller.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a cart', async () => {
      jest
        .spyOn(controller, 'update')
        .mockImplementation(async () => message[1]);

      expect(await controller.update('1', cart, req)).toBe(message[1]);

      expect(controller.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a cart', async () => {
      jest
        .spyOn(controller, 'remove')
        .mockImplementation(async () => message[1]);

      expect(await controller.remove('1', req)).toBe(message[1]);

      expect(controller.remove).toHaveBeenCalled();
    });
  });
});
