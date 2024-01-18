import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewKeys } from 'src/shared/keys/reviews.keys';
import { env } from 'process';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}
  async create(createReviewDto: CreateReviewDto, req: any) {
    const { productVariantId, rating, review } = createReviewDto;
    const { user } = req;

    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });
    if (!customer) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ReviewKeys.CUSTOMER_NOT_FOUND,
      };
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
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ReviewKeys.NOT_PURCHASED,
      };
    }
    const productVariantIds = HistoryproductVariantIdsArray.flat();
    if (!productVariantIds.includes(productVariantId)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ReviewKeys.NOT_PURCHASED,
      };
    }
    const product = await this.prisma.productVariant.findUnique({
      where: {
        id: productVariantId,
        isDeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ReviewKeys.PRODUCT_NOT_FOUND,
      };
    }
    const reviewData = await this.prisma.customerReviews.create({
      data: {
        rating,
        review,
        customerId: customer.id,
        productVariantId,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: ReviewKeys.CREATED_SUCCESSFULLY,
      data: reviewData,
    };
  }

  async findAll(req: any) {
    const { user } = req;
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });
    if (admin) {
      const reviews = await this.prisma.customerReviews.findMany({
        where: {
          isDeleted: false,
        },
        include: {
          product: true,
          customer: true,
        },
      });

      if (reviews[0] == null) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ReviewKeys.REVIEW_NOT_FOUND,
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: ReviewKeys.FETCHED_SUCCESSFULLY_ADMIN,
        data: reviews,
      };
    }

    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    if (!customer) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ReviewKeys.CUSTOMER_NOT_FOUND,
      };
    }
    const reviews = await this.prisma.customerReviews.findMany({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
      include: {
        product: true,
      },
    });

    if (reviews[0] == null) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ReviewKeys.REVIEW_NOT_FOUND,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: ReviewKeys.FETCHED_SUCCESSFULLY,
      data: reviews,
    };
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
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ReviewKeys.CUSTOMER_NOT_FOUND,
      };
    }

    const review = await this.prisma.customerReviews.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!review) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ReviewKeys.REVIEW_NOT_FOUND,
      };
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
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ReviewKeys.CUSTOMER_NOT_FOUND,
      };
    }

    const review = await this.prisma.customerReviews.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!review) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ReviewKeys.REVIEW_NOT_FOUND,
      };
    }

    const updatedReview = await this.prisma.customerReviews.update({
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
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ReviewKeys.NOT_AUTHORIZED,
        };
      }

      const review = await this.prisma.customerReviews.findFirst({
        where: {
          id: id,
          isDeleted: false,
        },
      });

      if (!review) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ReviewKeys.REVIEW_NOT_FOUND,
        };
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
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ReviewKeys.REVIEW_NOT_FOUND,
      };
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
}
