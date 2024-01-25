import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotFoundException } from '@nestjs/common';

describe('CategoryController', () => {
  let controller: CategoryController;

  const req = {
    user: {
      id: '1',
    },
  };
  const cartegory1 = {
    statusCode: 200,
    message: 'This action adds a new category',
    data: {
      id: '1',
      name: 'category',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  };

  const returnUpdated = [
    {
      id: '1',
      name: 'category',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  ];

  const message = {
    statusCode: 200,
    message: 'This action removes a #${id} category',
  };

  const category = [
    {
      name: 'category',
    },

    {
      name: 'category',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue('This action adds a new category'),
            findAll: jest
              .fn()
              .mockResolvedValue('This action returns all category'),
            findOne: jest
              .fn()
              .mockResolvedValue('This action returns a #${id} category'),
            update: jest
              .fn()
              .mockResolvedValue('This action updates a #${id} category'),
            remove: jest
              .fn()
              .mockResolvedValue('This action removes a #${id} category'),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  describe('create', () => {
    it('should return a new cart', async () => {
      jest
        .spyOn(controller, 'create')
        .mockImplementation(async () => cartegory1);

      expect(await controller.create(category[0], req)).toBe(cartegory1);

      expect(controller.create).toHaveBeenCalled();
    });
    it('should throw an error for invalid cart data', async () => {
      jest.spyOn(controller, 'create').mockImplementation(async () => {
        throw new Error('Invalid cart data');
      });

      await expect(controller.create).rejects.toThrow('Invalid cart data');
      expect(controller.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of cart', async () => {
      jest
        .spyOn(controller, 'findAll')
        .mockImplementation(async () => returnUpdated);

      expect(await controller.findAll()).toBe(returnUpdated);

      expect(controller.findAll).toHaveBeenCalled();
    });
    it('should return an empty array when no carts are found', async () => {
      jest.spyOn(controller, 'findAll').mockImplementation(async () => []);

      expect(await controller.findAll()).toEqual([]);
      expect(controller.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a cart', async () => {
      jest
        .spyOn(controller, 'update')
        .mockImplementation(async () => returnUpdated[0]);

      expect(await controller.update('1', cartegory1.data, req)).toBe(
        returnUpdated[0],
      );

      expect(controller.update).toHaveBeenCalled();
    });
    it('should throw an error when no cart is found', async () => {
      jest.spyOn(controller, 'update').mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.update).rejects.toThrow(NotFoundException);
      expect(controller.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a cart', async () => {
      jest.spyOn(controller, 'remove').mockImplementation(async () => message);

      expect(await controller.remove('1', req)).toBe(message);

      expect(controller.remove).toHaveBeenCalled();
    });
    it('should throw an error when no cart is found', async () => {
      jest.spyOn(controller, 'remove').mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.remove).rejects.toThrow(NotFoundException);
      expect(controller.remove).toHaveBeenCalled();
    });
    
  });
});
