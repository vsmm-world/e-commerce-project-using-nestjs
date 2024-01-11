import { Injectable } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}
  async create(createProductVariantDto: CreateProductVariantDto, req: any) {
    const { product_id, size, color, stock, price } = createProductVariantDto;
    const { user } = req;

    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });

    if (!admin) {
      return {
        statusCode: 400,
        message: 'Only admin can create product variant',
      };
    }
    const product = await this.prisma.product.findUnique({
      where: {
        id: product_id,
        isdeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: 400,
        message: 'Product not found',
      };
    }

    const productVariant = await this.prisma.product_variant.create({
      data: {
        product: { connect: { id: product_id } },
        size,
        color,
        stock,
        price,
      },
    });

    return {
      statusCode: 200,
      message: 'Product variant created successfully',
      data: productVariant,
    };
  }

  async findAll() {
    const productVariants = await this.prisma.product_variant.findMany({
      where: {
        isdeleted: false,
        stock: {
          gt: 0,
        },
      },
    });
    if (productVariants[0] == null) {
      return {
        statusCode: 400,
        message: 'Product variants not found',
      };
    }

    return {
      statusCode: 200,
      message: 'Product variants fetched successfully',
      data: productVariants,
    };
  }

  async findOne(id: string) {
    const productVariant = await this.prisma.product_variant.findFirst({
      where: {
        id,
        isdeleted: false,
        stock: {
          gt: 0,
        },
      },
    });

    if (!productVariant) {
      return {
        statusCode: 400,
        message: 'Product variant not found',
      };
    }

    return {
      statusCode: 200,
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
        isdeleted: false,
      },
    });
    if (!admin) {
      return {
        statusCode: 400,
        message: 'Only admin can update product variant',
      };
    }
    const productVariantCheck = await this.prisma.product_variant.findFirst({
      where: {
        id,
        isdeleted: false,
      },
    });
    if (!productVariantCheck) {
      return {
        statusCode: 400,
        message: 'Product variant not found',
      };
    }
    const productVariant = await this.prisma.product_variant.update({
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
      statusCode: 200,
      message: 'Product variant updated successfully',
      data: productVariant,
    };
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });

    if (!admin) {
      return {
        statusCode: 400,
        message: 'Only admin can delete product variant',
      };
    }
    const productVariantCheck = await this.prisma.product_variant.findFirst({
      where: {
        id,
        isdeleted: false,
      },
    });
    if (!productVariantCheck) {
      return {
        statusCode: 400,
        message: 'Product variant not found',
      };
    }

    const productVariant = await this.prisma.product_variant.update({
      where: {
        id,
        isdeleted: false,
      },
      data: {
        isdeleted: true,
      },
    });

    return {
      statusCode: 200,
      message: 'Product variant deleted successfully',
    };
  }
}
