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
      throw new Error('Admin not found');
    }
    const product = await this.prisma.product.findUnique({
      where: {
        id: product_id,
        isdeleted: false,
      },
    });
    if (!product) {
      throw new Error('Product not found');
    }

    const productVariant = await this.prisma.product_variant
      .create({
        data: {
          product: { connect: { id: product_id } },
          size,
          color,
          stock,
          price,
        },
      })
      .catch((err) => {
        throw new Error('Failed to create product variant');
      });

    return {
      statusCode: 200,
      message: 'Product variant created successfully',
      data: productVariant,
    };
  }

  async findAll() {
    const productVariants = await this.prisma.product_variant
      .findMany({
        where: {
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error('Failed to fetch product variants');
      });
    return {
      statusCode: 200,
      message: 'Product variants fetched successfully',
      data: productVariants,
    };
  }

  async findOne(id: string) {
    const productVariant = await this.prisma.product_variant
      .findFirst({
        where: {
          id,
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error('Failed to fetch product variant');
      });

    if (!productVariant) {
      throw new Error('Product variant not found');
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
    const admin = await this.prisma.admin
      .findUnique({
        where: {
          id: user.id,
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error('Admin not found');
      });
    if (!admin) {
      throw new Error('You are not admin');
    }
    const productVariant = await this.prisma.product_variant
      .update({
        where: {
          id,
        },
        data: {
          size,
          color,
          stock,
          price,
        },
      })
      .catch((err) => {
        throw new Error('Failed to update product variant');
      });

    return {
      statusCode: 200,
      message: 'Product variant updated successfully',
      data: productVariant,
    };
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const admin = await this.prisma.admin
      .findUnique({
        where: {
          id: user.id,
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error('Admin not found');
      });
    if (!admin) {
      throw new Error('You are not admin');
    }

    const productVariant = await this.prisma.product_variant
      .update({
        where: {
          id,
          isdeleted: false,
        },
        data: {
          isdeleted: true,
        },
      })
      .catch((err) => {
        throw new Error('Failed to delete product variant');
      });

    return {
      statusCode: 200,
      message: 'Product variant deleted successfully',
      data: productVariant,
    };
  }
}
