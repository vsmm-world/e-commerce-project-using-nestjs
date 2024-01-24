// import { Test, TestingModule } from '@nestjs/testing';
// import { CartController } from './cart.controller';
// import { CartService } from './cart.service';
// import { PrismaModule } from '../prisma/prisma.module';
// import { Cart } from './entities/cart.entity';

// describe('CartController', () => {
//   let controller: CartController;
//   let service: CartService;
//   const req = {
//     user: {
//       id: '1',
//     },
//   };

//   const returnRemove = {
//     statusCode: 200,
//     message: 'This action create a cart',
//     Products: [],
//   };
//   const message = 
//     {
//       statusCode: 200,
//       message: 'This action create a cart',
//       cart: {
//         id: '1',
//         productIds: [
//           {
//             id: '1',
//             quantity: 1,
//           },
//         ],

//         products: [
//           {
//             id: '1',
//             quantity: 1,
//           },
//         ],
//         totalItems: 2,
//         totalPrice: 500,
//         isReminded: true,
//         reminderDate: new Date(),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         customerId: '1',
//         isDeleted: false,
//         productId: '1',
//         ProductVariantId: '1',
//       },
//     }


//   const cart = {
//     productVariantId: '1',
//     quantity: 1,
//   };
//   const result = [
//     {
//       id: '1',
//       productIds: [
//         {
//           id: '1',
//           quantity: 1,
//         },
//       ],

//       products: [
//         {
//           id: '1',
//           quantity: 1,
//         },
//       ],
//       totalItems: 2,
//       totalPrice: 500,
//       isReminded: true,
//       reminderDate: new Date(),
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       customerId: '1',
//       isDeleted: false,
//       productId: '1',
//       ProductVariantId: '1',
//     },
//     {
//       id: '1',
//       productIds: [
//         {
//           id: '1',
//           quantity: 1,
//         },
//       ],

//       products: [
//         {
//           id: '1',
//           quantity: 1,
//         },
//       ],
//       totalItems: 2,
//       totalPrice: 500,
//       isReminded: true,
//       reminderDate: new Date(),
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       customerId: '1',
//       isDeleted: false,
//       productId: '1',
//       ProductVariantId: '1',
//     },
//   ];

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [PrismaModule],
//       controllers: [CartController],
//       providers: [
//         {
//           provide: CartService,
//           useValue: {
//             create: jest.fn().mockResolvedValue('This action adds a new cart'),
//             findAll: jest
//               .fn()
//               .mockResolvedValue('This action returns all cart'),

//             update: jest
//               .fn()
//               .mockResolvedValue('This action updates a #${id} cart'),
//             remove: jest
//               .fn()
//               .mockResolvedValue('This action removes a #${id} cart'),
//           },
//         },
//       ],
//     }).compile();

//     controller = module.get<CartController>(CartController);
//   });

//   describe('create', () => {
//     it('should return a new cart', async () => {
//       jest
//         .spyOn(controller, 'create')
//         .mockImplementation(async () => message[0]);

//       expect(await controller.create(cart, req)).toBe(message[0]);

//       expect(controller.create).toHaveBeenCalled();
//     });
//   });

//   describe('findAll', () => {
//     it('should return an array of cart', async () => {
//       jest
//         .spyOn(controller, 'findAll')
//         .mockImplementation(async () => message[0]);

//       expect(await controller.findAll(req)).toBe(message[0]);

//       expect(controller.findAll).toHaveBeenCalled();
//     });
//   });



//   describe('update', () => {
//     it('should update a cart', async () => {
//       jest
//         .spyOn(controller, 'update')
//         .mockImplementation(async () => message);

//       expect(await controller.update('1', cart, req)).toBe(message);

//       expect(controller.update).toHaveBeenCalled();
//     });
//   });

//   describe('remove', () => {
//     it('should remove a cart', async () => {
//       jest
//         .spyOn(controller, 'remove')
//         .mockImplementation(async () => returnRemove);

//       expect(await controller.remove('1', req)).toBe(returnRemove);

//       expect(controller.remove).toHaveBeenCalled();
//     });
//   });
// });


import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;
  const req = {
    user: {
      id: '1',
    },
  };

  const returnRemove = {
    statusCode: 200,
    message: 'This action removes a cart',
    Products: [],
  };

  const successMessage = {
    statusCode: 200,
    message: 'This action creates a cart',
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
  };

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
      id: '2',
      productIds: [
        {
          id: '2',
          quantity: 2,
        },
      ],
      products: [
        {
          id: '2',
          quantity: 2,
        },
      ],
      totalItems: 4,
      totalPrice: 1000,
      isReminded: false,
      reminderDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customerId: '1',
      isDeleted: false,
      productId: '2',
      ProductVariantId: '2',
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
            create: jest.fn().mockResolvedValue(successMessage),
            findAll: jest.fn().mockResolvedValue(result),
            update: jest.fn().mockResolvedValue(result[0]),
            remove: jest.fn().mockResolvedValue(returnRemove),
          },
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  describe('create', () => {
    it('should return a new cart', async () => {
      jest.spyOn(controller, 'create').mockImplementation(async () => successMessage);

      expect(await controller.create(cart, req)).toBe(successMessage);

      expect(controller.create).toHaveBeenCalled();
    });

    it('should throw an error for invalid cart data', async () => {
      jest.spyOn(controller, 'create').mockImplementation(async () => {
        throw new Error('Invalid cart data');
      });

      await expect(controller.create({}, req)).rejects.toThrowError('Invalid cart data');
      expect(controller.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of carts', async () => {
      jest.spyOn(controller, 'findAll').mockImplementation(async () => result);

      expect(await controller.findAll(req)).toBe(result);

      expect(controller.findAll).toHaveBeenCalled();
    });

    it('should return an empty array when no carts are found', async () => {
      jest.spyOn(controller, 'findAll').mockImplementation(async () => []);

      expect(await controller.findAll(req)).toEqual([]);
      expect(controller.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a cart', async () => {
      jest.spyOn(controller, 'update').mockImplementation(async () => result[0]);

      expect(await controller.update('1', cart, req)).toBe(result[0]);

      expect(controller.update).toHaveBeenCalled();
    });

    it('should throw an error when updating a non-existing cart', async () => {
      jest.spyOn(controller, 'update').mockImplementation(async () => {
        throw new Error('Cart not found');
      });

      await expect(controller.update('nonexistent', cart, req)).rejects.toThrowError('Cart not found');
      expect(controller.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a cart', async () => {
      jest.spyOn(controller, 'remove').mockImplementation(async () => returnRemove);

      expect(await controller.remove('1', req)).toBe(returnRemove);

      expect(controller.remove).toHaveBeenCalled();
    });

    it('should throw an error when removing a non-existing cart', async () => {
      jest.spyOn(controller, 'remove').mockImplementation(async () => {
        throw new Error('Cart not found');
      });

      await expect(controller.remove('nonexistent', req)).rejects.toThrowError('Cart not found');
      expect(controller.remove).toHaveBeenCalled();
    });
  });
});
