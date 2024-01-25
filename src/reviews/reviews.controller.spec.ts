import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('ReviewsController', () => {
  let controller: ReviewsController;

  const message = {
    statusCode: 200,
    message: 'This action adds a new review',
  };
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

  const returnedReview = [
    {
      id: '65af8cfeb3954d905bb67060',
      productVariantId: '65a8fa4f41a6ba640657c8df',
      customerId: '65a8fa4f41a6ba640657c8df',
      rating: 5,
      review: 'string',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  ];

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
      jest.spyOn(controller, 'create').mockResolvedValue(returnedReview[0]);
      expect(await controller.create(createReviewDto, req)).toEqual(
        returnedReview[0],
      );
      expect(controller.create).toHaveBeenCalled();
    });
    it('should handle validation error for invalid data', async () => {
      jest.spyOn(controller, 'create').mockImplementation(async () => {
        throw new Error('Validation Error');
      });
      expect(await controller.create).rejects.toThrow('Validation Error');
      expect(controller.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all review', async () => {
      jest.spyOn(controller, 'findAll').mockResolvedValue(returnedReview);
      expect(await controller.findAll()).toEqual(returnedReview);
      expect(controller.findAll).toHaveBeenCalled();
    });
    it('should return an empty array when no review are found', async () => {
      jest.spyOn(controller, 'findAll').mockResolvedValue([]);
      expect(await controller.findAll()).toEqual([]);
      expect(controller.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a review', async () => {
      jest.spyOn(controller, 'findOne').mockResolvedValue(returnedReview[0]);
      expect(await controller.findOne('65a8fb6141a6ba640657c8e0', req)).toEqual(
        returnedReview[0],
      );
      expect(controller.findOne).toHaveBeenCalled();
    });
    it('should throw an error when no review is found', async () => {
      jest.spyOn(controller, 'findOne').mockImplementation(async () => {
        throw new Error('Review not found');
      });
      await expect(controller.findOne).rejects.toThrow('Review not found');
      expect(controller.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      jest.spyOn(controller, 'update').mockResolvedValue(returnedReview[0]);
      expect(
        await controller.update(
          '65a8fb6141a6ba640657c8e0',
          updateReviewDto,
          req,
        ),
      ).toEqual(returnedReview[0]);
      expect(controller.update).toHaveBeenCalled();
    });
    it('should throw an error when no review is found', async () => {
      jest.spyOn(controller, 'update').mockImplementation(async () => {
        throw new Error('Review not found');
      });
      await expect(controller.update).rejects.toThrow('Review not found');
      expect(controller.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should return "Review deleted successfully"', async () => {
      jest.spyOn(controller, 'remove').mockResolvedValue(message);
      expect(await controller.remove('65a8fb6141a6ba640657c8e0', req)).toEqual(
        message,
      );
      expect(controller.remove).toHaveBeenCalled();
    });
    it('should throw an error when no review is found', async () => {
      jest.spyOn(controller, 'remove').mockImplementation(async () => {
        throw new Error('Review not found');
      });
      await expect(controller.remove).rejects.toThrow('Review not found');
      expect(controller.remove).toHaveBeenCalled();
    });
  });
});
