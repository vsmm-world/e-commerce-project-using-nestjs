import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewKeys } from '../shared/keys/reviews.keys';
import { env } from 'process';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}
  async create(createReviewDto: CreateReviewDto, req: any) {
    const { productVariantId, rating, review } = createReviewDto;
    const { user } = req;
    if (rating > 5 || rating < 1) {
      throw new Error(ReviewKeys.INVALID_RATING);
    }
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });
    if (!customer) {
      throw new NotFoundException(ReviewKeys.CUSTOMER_NOT_FOUND);
    }

    const orderHistory = await this.prisma.orderHistory.findMany({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
    });

    const HistoryproductVariantIdsArray = orderHistory.map((order) => {
      return order.productsIds;
    });
    if (HistoryproductVariantIdsArray[0] == null) {
      throw new Error(ReviewKeys.NOT_PURCHASED);
    }
    const productVariantIds = HistoryproductVariantIdsArray.flat();
    if (!productVariantIds.includes(productVariantId)) {
      throw new Error(ReviewKeys.NOT_PURCHASED);
    }
    const product = await this.prisma.productVariant.findUnique({
      where: {
        id: productVariantId,
        isDeleted: false,
      },
    });
    if (!product) {
      throw new NotFoundException(ReviewKeys.PRODUCT_NOT_FOUND);
    }
    return this.prisma.customerReviews.create({
      data: {
        rating,
        review,
        customerId: customer.id,
        productVariantId,
      },
    });
  }

  async findAll() {
    return this.prisma.customerReviews.findMany({
      where: {
        isDeleted: false,
      },
    });
  }

  async findOne(id: string, req: any) {
    const { user } = req;
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    if (!customer) {
      throw new NotFoundException(ReviewKeys.CUSTOMER_NOT_FOUND);
    }

    const review = await this.prisma.customerReviews.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!review) {
      throw new NotFoundException(ReviewKeys.REVIEW_NOT_FOUND);
    }
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, req: any) {
    const { user } = req;
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    if (!customer) {
      throw new NotFoundException(ReviewKeys.CUSTOMER_NOT_FOUND);
    }

    const review = await this.prisma.customerReviews.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!review) {
      throw new NotFoundException(ReviewKeys.REVIEW_NOT_FOUND);
    }
    return this.prisma.customerReviews.update({
      where: {
        id: id,
      },
      data: {
        ...updateReviewDto,
      },
    });
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    if (!customer) {
      const admin = await this.prisma.admin.findUnique({
        where: {
          id: user.id,
          isDeleted: false,
        },
      });

      if (!admin) {
        throw new NotFoundException(ReviewKeys.CUSTOMER_NOT_FOUND);
      }

      const review = await this.prisma.customerReviews.findFirst({
        where: {
          id: id,
          isDeleted: false,
        },
      });

      if (!review) {
        throw new NotFoundException(ReviewKeys.REVIEW_NOT_FOUND);
      }

      const deletedReview = await this.prisma.customerReviews.update({
        where: {
          id: id,
        },
        data: {
          isDeleted: true,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: ReviewKeys.REVIEW_DELETED,
        data: deletedReview,
      };
    }

    const review = await this.prisma.customerReviews.findFirst({
      where: {
        id: id,
        customerId: customer.id,
        isDeleted: false,
      },
    });

    if (!review) {
      throw new NotFoundException(ReviewKeys.REVIEW_NOT_FOUND);
    }

    const deletedReview = await this.prisma.customerReviews.update({
      where: {
        id: id,
      },
      data: {
        isDeleted: true,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: ReviewKeys.REVIEW_DELETED,
    };
  }
}
