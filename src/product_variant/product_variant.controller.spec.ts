import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariantController } from './product_variant.controller';
import { ProductVariantService } from './product_variant.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotFoundException } from '@nestjs/common';

describe('ProductVariantController', () => {
  let controller: ProductVariantController;

  const req = {
    user: {
      id: '65a8fa4f41a6ba640657c8df',
    },
  };
  const createProductVariantDto = {
    productId: '65a8fa4f41a6ba640657c8df',
    size: 'string',
    color: 'string',
    stock: 5,
    price: 50,
  };

  const message = {
    statusCode: 200,
    message: 'Product variant deleted successfully',
  };

  const returnedProductVariant = {
    statusCode: 200,
    message: 'Product variant created successfully',
    data: {
      id: '65af8cfeb3954d905bb67060',
      productId: '65a8fa4f41a6ba640657c8df',
      size: 'string',
      color: 'string',
      stock: 5,
      price: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  };

  const returnUpdated = [
    {
      id: '65af8cfeb3954d905bb67060',
      productId: '65a8fa4f41a6ba640657c8df',
      size: 'XL',
      color: 'grey',
      stock: 10,
      price: 5000,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [ProductVariantController],
      providers: [
        {
          provide: ProductVariantService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue('This action adds a new product_variant'),
            findAll: jest
              .fn()
              .mockResolvedValue('This action returns all product_variant'),
            findOne: jest
              .fn()
              .mockResolvedValue(
                'This action returns a #${id} product_variant',
              ),
            update: jest
              .fn()
              .mockResolvedValue(
                'This action updates a #${id} product_variant',
              ),
            remove: jest
              .fn()
              .mockResolvedValue(
                'This action removes a #${id} product_variant',
              ),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductVariantController>(ProductVariantController);
  });

  describe('create', () => {
    it('should return created product variant', async () => {
      jest
        .spyOn(controller, 'create')
        .mockResolvedValue(returnedProductVariant);
      expect(await controller.create(createProductVariantDto, req)).toEqual(
        returnedProductVariant,
      );
      expect(controller.create).toHaveBeenCalled();
    });
    it('should handle validation error for invalid data', async () => {
      jest.spyOn(controller, 'create').mockImplementation(async () => {
        throw new Error('Invalid product variant data');
      });
      await expect(controller.create).rejects.toThrow(
        'Invalid product variant data',
      );
      expect(controller.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all product variant', async () => {
      jest.spyOn(controller, 'findAll').mockResolvedValue(returnUpdated);
      expect(await controller.findAll()).toEqual(returnUpdated);
      expect(controller.findAll).toHaveBeenCalled();
    });
    it('should return an empty array when no product variant are found', async () => {
      jest.spyOn(controller, 'findAll').mockImplementation(async () => []);
      expect(await controller.findAll()).toEqual([]);
      expect(controller.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return one product variant', async () => {
      jest.spyOn(controller, 'findOne').mockResolvedValue(returnUpdated[0]);
      expect(await controller.findOne('65af8cfeb3954d905bb67060')).toEqual(
        returnUpdated[0],
      );
      expect(controller.findOne).toHaveBeenCalled();
    });
    it('should throw an error when no product variant is found', async () => {
      jest.spyOn(controller, 'findOne').mockImplementation(async () => {
        throw new NotFoundException();
      });
      await expect(
        controller.findOne('65af8cfeb3954d905bb67060'),
      ).rejects.toThrow(NotFoundException);
      expect(controller.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update product variant', async () => {
      jest.spyOn(controller, 'update').mockResolvedValue(returnUpdated[0]);
      expect(
        await controller.update(
          '65af8cfeb3954d905bb67060',
          createProductVariantDto,
          req,
        ),
      ).toEqual(returnUpdated[0]);
      expect(controller.update).toHaveBeenCalled();
    });
    it('should throw an error when no product variant is found', async () => {
      jest.spyOn(controller, 'update').mockImplementation(async () => {
        throw new NotFoundException();
      });
      await expect(
        controller.update(
          '65af8cfeb3954d905bb67060',
          createProductVariantDto,
          req,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(controller.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete product variant', async () => {
      jest.spyOn(controller, 'remove').mockResolvedValue(message);
      expect(await controller.remove('65af8cfeb3954d905bb67060', req)).toEqual(
        message,
      );
      expect(controller.remove).toHaveBeenCalled();
    });

    it('should throw an error when no product variant is found', async () => {
      jest.spyOn(controller, 'remove').mockImplementation(async () => {
        throw new NotFoundException();
      });
      await expect(
        controller.remove('65af8cfeb3954d905bb67060', req),
      ).rejects.toThrow(NotFoundException);
      expect(controller.remove).toHaveBeenCalled();
    });
  });
});
