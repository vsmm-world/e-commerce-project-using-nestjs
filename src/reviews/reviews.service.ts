import { Injectable } from '@nestjs/common';
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
        isdeleted: false,
      },
    });
    if (!customer) {
      return {
        statusCode: 404,
        message: 'Customer not found',
      };
    }

    const orderHistory = await this.prisma.orderHistory.findMany({
      where: {
        customerId: customer.id,
        isdeleted: false,
      },
    });

    const HistoryProductIdsArray = orderHistory.map((order) => {
      return order.productsIds;
    });

    const productIds = HistoryProductIdsArray.flat();
    if (!productIds.includes(productId)) {
      return {
        statusCode: 404,
        message: 'you have not purchased this product so you can not review it',
      };
    }
    const product = await this.prisma.product_variant.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: 404,
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
      statusCode: 200,
      message: 'Review added successfully',
      data: reviewData,
    };
  }

  async findAll(req: any) {
    const { user } = req;
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });
    if (admin) {
      const reviews = await this.prisma.customerReviews.findMany({
        where: {
          isdeleted: false,
        },
        include: {
          product: true,
          customer: true,
        },
      });

      return {
        statusCode: 200,
        message: 'Reviews fetched as admin successfully',
        data: reviews,
      };
    }
    
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });

    if (!customer) {
      return {
        statusCode: 404,
        message: 'Customer not found',
      };
    }
    const reviews = await this.prisma.customerReviews.findMany({
      where: {
        customerId: customer.id,
        isdeleted: false,
      },
      include: {
        product: true,
      },
    });

    return {
      statusCode: 200,
      message: 'Reviews found successfully',
      data: reviews,
    };
  }

  async findOne(id: string, req: any) {
    const { user } = req;
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });

    if (!customer) {
      return {
        statusCode: 404,
        message: 'Customer not found',
      };
    }

    const review = await this.prisma.customerReviews.findFirst({
      where: {
        id: id,
        isdeleted: false,
      },
    });

    if (!review) {
      return {
        statusCode: 404,
        message: 'Review not found',
      };
    }
  }

  async update(id: string, req: any, updateReviewDto: UpdateReviewDto) {
    const { user } = req;
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });

    if (!customer) {
      return {
        statusCode: 404,
        message: 'Customer not found',
      };
    }

    const review = await this.prisma.customerReviews.findFirst({
      where: {
        id: id,
        isdeleted: false,
      },
    });

    if (!review) {
      return {
        statusCode: 404,
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
        isdeleted: false,
      },
    });

    if (!customer) {
      const admin = await this.prisma.admin.findUnique({
        where: {
          id: user.id,
          isdeleted: false,
        },
      });

      if (!admin) {
        return {
          statusCode: 404,
          message: 'You are not authorized to delete this review',
        };
      }

      const review = await this.prisma.customerReviews.findFirst({
        where: {
          id: id,
          customerId: customer.id,
          isdeleted: false,
        },
      });

      if (!review) {
        return {
          statusCode: 404,
          message: 'Review not found',
        };
      }

      const deletedReview = await this.prisma.customerReviews.update({
        where: {
          id: id,
        },
        data: {
          isdeleted: true,
        },
      });

      return {
        statusCode: 200,
        message: 'Review deleted successfully',
        data: deletedReview,
      };
    }

    const review = await this.prisma.customerReviews.findFirst({
      where: {
        id: id,
        isdeleted: false,
      },
    });

    if (!review) {
      return {
        statusCode: 404,
        message: 'Review not found',
      };
    }

    const deletedReview = await this.prisma.customerReviews.update({
      where: {
        id: id,
      },
      data: {
        isdeleted: true,
      },
    });

    return {
      statusCode: 200,
      message: 'Review deleted successfully',
      data: deletedReview,
    };
  }
}
