import { HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}
  async create(createProductVariantDto: CreateProductVariantDto, req: any) {
    const { product_id, size, color, stock, price } = createProductVariantDto;
    const { user } = req;

    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    if (!admin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Only admin can create product variant',
      };
    }
    const product = await this.prisma.product.findUnique({
      where: {
        id: product_id,
        isDeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product not found',
      };
    }

    const productVariant = await this.prisma.productVariant.create({
      data: {
        product: { connect: { id: product_id } },
        size,
        color,
        stock,
        price,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Product variant created successfully',
      data: productVariant,
    };
  }

  async findAll() {
    const productVariants = await this.prisma.productVariant.findMany({
      where: {
        isDeleted: false,
        stock: {
          gt: 0,
        },
      },
    });
    if (productVariants[0] == null) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product variants not found',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Product variants fetched successfully',
      data: productVariants,
    };
  }

  async findOne(id: string) {
    const productVariant = await this.prisma.productVariant.findFirst({
      where: {
        id,
        isDeleted: false,
        stock: {
          gt: 0,
        },
      },
    });

    if (!productVariant) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product variant not found',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Product variant fetched successfully',
      data: productVariant,
    };
  }

  async update(
    id: string,
    updateProductVariantDto: UpdateProductVariantDto,
    req: any,
  ) {
    const { size, color, stock, price } = updateProductVariantDto;
    const { user } = req;
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });
    if (!admin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Only admin can update product variant',
      };
    }
    const productVariantCheck = await this.prisma.productVariant.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
    if (!productVariantCheck) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product variant not found',
      };
    }
    const productVariant = await this.prisma.productVariant.update({
      where: {
        id,
      },
      data: {
        size,
        color,
        stock,
        price,
      },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Product variant updated successfully',
      data: productVariant,
    };
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    if (!admin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Only admin can delete product variant',
      };
    }
    const productVariantCheck = await this.prisma.productVariant.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
    if (!productVariantCheck) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product variant not found',
      };
    }

    const productVariant = await this.prisma.productVariant.update({
      where: {
        id,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Product variant deleted successfully',
    };
  }
}
