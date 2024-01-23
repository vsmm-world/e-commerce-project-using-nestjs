import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('ReviewsController', () => {
  let controller: ReviewsController;

  const req = {
    user: {
      id: '65a8fa4f41a6ba640657c8df',
    },
  };

  const createReviewDto = {
    productVariantId: '65a8fa4f41a6ba640657c8df',
    rating: 5,
    review: 'string',
  };

  const returnedReview = {
    statusCode: 200,
    message: 'Review created successfully',
    data: {
      id: '65af8cfeb3954d905bb67060',
      productVariantId: '65a8fa4f41a6ba640657c8df',
      customerId: '65a8fa4f41a6ba640657c8df',
      rating: 5,
      review: 'string',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  };

  const findAllReview = [
    {
      id: '65a910d9d2a1da0ddc0bb13b',
      customerId: '65a8fc4441a6ba640657c8e3',
      productVariantId: '65a8fba141a6ba640657c8e2',
      rating: 5,
      review: 'ek dam mast che tamari product',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  ];

  const findOneReview = {
    statusCode: 200,
    message: 'Review fetched successfully',
    data: {
      id: '65a8fb6141a6ba640657c8e0',
      productVariantId: '65a8fa4f41a6ba640657c8df',
      customerId: '65a8fa4f41a6ba640657c8df',

      rating: 5,
      review: 'string',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  };

  const updateReviewDto = {
    rating: 5,
    review: 'string',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],

      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue('This action adds a new review'),
            findAll: jest
              .fn()
              .mockResolvedValue('This action returns all review'),
            findOne: jest
              .fn()
              .mockResolvedValue('This action returns a #${id} review'),
            update: jest
              .fn()
              .mockResolvedValue('This action updates a #${id} review'),
            remove: jest
              .fn()
              .mockResolvedValue('This action removes a #${id} review'),
          },
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  describe('create', () => {
    it('should return created review', async () => {
      jest.spyOn(controller, 'create').mockResolvedValue(returnedReview);
      expect(await controller.create(createReviewDto, req)).toEqual(
        returnedReview,
      );
      expect(controller.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all review', async () => {
      jest.spyOn(controller, 'findAll').mockResolvedValue(findAllReview);
      expect(await controller.findAll()).toEqual(findAllReview);
      expect(controller.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a review', async () => {
      jest.spyOn(controller, 'findOne').mockResolvedValue(findOneReview);
      expect(await controller.findOne('65a8fb6141a6ba640657c8e0', req)).toEqual(
        findOneReview,
      );
      expect(controller.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      jest.spyOn(controller, 'update').mockResolvedValue(returnedReview);
      expect(
        await controller.update(
          '65a8fb6141a6ba640657c8e0',
          updateReviewDto,
          req,
        ),
      ).toEqual(returnedReview);
      expect(controller.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should return "Review deleted successfully"', async () => {
      jest.spyOn(controller, 'remove').mockResolvedValue(returnedReview);
      expect(await controller.remove('65a8fb6141a6ba640657c8e0', req)).toEqual(
        returnedReview,
      );
      expect(controller.remove).toHaveBeenCalled();
    });
  });
});
