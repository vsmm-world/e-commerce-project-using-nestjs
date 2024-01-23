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

  const returnedProduct = {
    statusCode: 201,
    message: 'Product created successfully',
    data: {
      id: '65af99da15ca634a7f2df712',
      name: 'string',
      description: 'string',
      categoryId: '65a8fa1341a6ba640657c8de',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  };

  const findAllProduct = {
    statusCode: 200,
    message: 'Product fetched successfully',
    data: [
      {
        id: '65a8fa4f41a6ba640657c8df',
        name: 'Sugar',
        description: 'ek dam mast sugar',
        categoryId: '65a8fa1341a6ba640657c8de',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      },
      {
        id: '65af99da15ca634a7f2df712',
        name: 'string',
        description: 'string',
        categoryId: '65a8fa1341a6ba640657c8de',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      },
    ],
  };
  const findOneProduct = {
    statusCode: 200,
    message: 'Product fetched successfully',
    data: {
      id: '65a8fa4f41a6ba640657c8df',
      name: 'Sugar',
      description: 'ek dam mast sugar',
      categoryId: '65a8fa1341a6ba640657c8de',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  };

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
      jest.spyOn(controller, 'create').mockResolvedValue(returnedProduct);
      expect(await controller.create(createProductDto, req)).toEqual(
        returnedProduct,
      );
      expect(controller.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all product', async () => {
      jest.spyOn(controller, 'findAll').mockResolvedValue(findAllProduct);
      expect(await controller.findAll(req)).toEqual(findAllProduct);
      expect(controller.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product', async () => {
      jest.spyOn(controller, 'findOne').mockResolvedValue(findOneProduct);
      expect(await controller.findOne('65a8fa4f41a6ba640657c8df', req)).toEqual(
        findOneProduct,
      );
      expect(controller.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      jest.spyOn(controller, 'update').mockResolvedValue(findOneProduct);
      expect(
        await controller.update('65a8fa4f41a6ba640657c8df', updateProduct, req),
      ).toEqual(findOneProduct);
      expect(controller.update).toHaveBeenCalled();
    });
  });
});
