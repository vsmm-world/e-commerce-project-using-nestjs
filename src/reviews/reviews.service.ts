import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}
  async create(createReviewDto: CreateReviewDto, req: any) {
    const { productId, rating, review } = createReviewDto;
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
        message: 'Customer not found',
      };
    }

    const orderHistory = await this.prisma.orderHistory.findMany({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
    });

    const HistoryProductIdsArray = orderHistory.map((order) => {
      return order.productsIds;
    });
    if (HistoryProductIdsArray[0] == null) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'you have not purchased this product so you can not review it',
      };
    }
    const productIds = HistoryProductIdsArray.flat();
    if (!productIds.includes(productId)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'you have not purchased this product so you can not review it',
      };
    }
    const product = await this.prisma.productVariant.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product not found',
      };
    }
    const reviewData = await this.prisma.customerReviews.create({
      data: {
        rating,
        review,
        customer: {
          connect: {
            id: customer.id,
          },
        },
        product: {
          connect: {
            id: productId,
          },
        },
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Review added successfully',
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
          message: 'No reviews found',
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Reviews fetched as admin successfully',
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
        message: 'Customer not found',
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
        message: 'No reviews found',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Reviews found successfully',
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
        message: 'Customer not found',
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
        message: 'Review not found',
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
        message: 'Customer not found',
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
        message: 'Review not found',
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
          message: 'You are not authorized to delete this review',
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
          message: 'Review not found',
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
        message: 'Review deleted successfully',
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
        message: 'Review not found',
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
      message: 'Review deleted successfully',
      data: deletedReview,
    };
  }
}
