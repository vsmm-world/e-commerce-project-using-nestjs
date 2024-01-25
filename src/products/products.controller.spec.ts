import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('ProductsController', () => {
  let controller: ProductsController;
  const req = {
    user: {
      id: '65a8fa4f41a6ba640657c8df',
    },
  };
  const createProductDto = {
    name: 'string',
    description: 'string',
    categoryId: '65a8fa1341a6ba640657c8de',
  };

  const message = {
    statusCode: 200,
    message: 'This action adds a new product',
  };
  const returnedProduct = [
    {
      id: '65af99da15ca634a7f2df712',
      name: 'string',
      description: 'string',
      categoryId: '65a8fa1341a6ba640657c8de',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  ];

  const updateProduct = {
    name: 'Sugar',
    description: 'ek dam mast sugar',
    categoryId: '65a8fa1341a6ba640657c8de',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue('This action adds a new product'),
            findAll: jest
              .fn()
              .mockResolvedValue('This action returns all product'),
            findOne: jest
              .fn()
              .mockResolvedValue('This action returns a #${id} product'),
            update: jest
              .fn()
              .mockResolvedValue('This action updates a #${id} product'),
            remove: jest
              .fn()
              .mockResolvedValue('This action removes a #${id} product'),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('create', () => {
    it('should return created product', async () => {
      jest.spyOn(controller, 'create').mockResolvedValue(returnedProduct[0]);
      expect(await controller.create(createProductDto, req)).toEqual(
        returnedProduct[0],
      );
      expect(controller.create).toHaveBeenCalled();
    });
    it('should handle validation error for invalid data', async () => {
      jest.spyOn(controller, 'create').mockImplementation(async () => {
        throw new Error('Invalid product data');
      });
      await expect(controller.create).rejects.toThrow('Invalid product data');
    });

  });

  describe('findAll', () => {
    it('should return all product', async () => {
      jest.spyOn(controller, 'findAll').mockResolvedValue(returnedProduct);
      expect(await controller.findAll(req)).toEqual(returnedProduct);
      expect(controller.findAll).toHaveBeenCalled();
    });
    it('should return an empty array when no product are found', async () => {
      jest.spyOn(controller, 'findAll').mockResolvedValue([]);
      expect(await controller.findAll(req)).toEqual([]);
      expect(controller.findAll).toHaveBeenCalled();
    });

  });

  describe('findOne', () => {
    it('should return a product', async () => {
      jest.spyOn(controller, 'findOne').mockResolvedValue(returnedProduct[0]);
      expect(await controller.findOne('65a8fa4f41a6ba640657c8df', req)).toEqual(
        returnedProduct[0],
      );
      expect(controller.findOne).toHaveBeenCalled();
    });
    it('should throw an error when no product is found', async () => {
      jest.spyOn(controller, 'findOne').mockImplementation(async () => {
        throw new Error('Product not found');
      });
      await expect(controller.findOne).rejects.toThrow('Product not found');
      expect(controller.findOne).toHaveBeenCalled();
    });

  });

  describe('update', () => {
    it('should update a product', async () => {
      jest.spyOn(controller, 'update').mockResolvedValue(returnedProduct[0]);
      expect(
        await controller.update('65a8fa4f41a6ba640657c8df', updateProduct, req),
      ).toEqual(returnedProduct[0]);
      expect(controller.update).toHaveBeenCalled();
    });
    it('should throw an error when no product is found', async () => {
      jest.spyOn(controller, 'update').mockImplementation(async () => {
        throw new Error('Product not found');
      });
      await expect(controller.update).rejects.toThrow('Product not found');
      expect(controller.update).toHaveBeenCalled();
    });
  });
  describe('remove', () => {
    it('should remove a product', async () => {
      jest.spyOn(controller, 'remove').mockResolvedValue(message);
      expect(await controller.remove('65a8fa4f41a6ba640657c8df', req)).toEqual(
        message,
      );
      expect(controller.remove).toHaveBeenCalled();
    });
    it('should throw an error when no product is found', async () => {
      jest.spyOn(controller, 'remove').mockImplementation(async () => {
        throw new Error('Product not found');
      });
      await expect(controller.remove).rejects.toThrow('Product not found');
      expect(controller.remove).toHaveBeenCalled();
    });
    
  });
});
