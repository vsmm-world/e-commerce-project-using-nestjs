import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';
import { ProductKeys } from '../shared/keys/products.keys';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}
  async create(createProductVariantDto: CreateProductVariantDto, req: any) {
    const { productId } = createProductVariantDto;
    const { user } = req;

    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    if (!admin) {
      throw new Error(ProductKeys.ONLY_ADMIN);
    }
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
        isDeleted: false,
      },
    });
    if (!product) {
      throw new NotFoundException(ProductKeys.PRODUCT_NOT_FOUND);
    }

    const productVariant = await this.prisma.productVariant.create({
      data: {
        ...createProductVariantDto,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: ProductKeys.PRODUCT_VARIANT_CREATED,
      data: productVariant,
    };
  }

  async findAll() {
    return this.prisma.productVariant.findMany({
      where: {
        isDeleted: false,
        stock: {
          gt: 0,
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.productVariant.findFirst({
      where: {
        id,
        isDeleted: false,
        stock: {
          gt: 0,
        },
      },
    });
  }

  async update(
    id: string,
    updateProductVariantDto: UpdateProductVariantDto,
    req: any,
  ) {
    const { user } = req;
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });
    if (!admin) {
      throw new Error(ProductKeys.ONLY_ADMIN);
    }
    const productVariantCheck = await this.prisma.productVariant.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
    if (!productVariantCheck) {
     throw new NotFoundException(ProductKeys.PRODUCT_VARIANT_NOT_FOUND);
    }
    return this.prisma.productVariant.update({
      where: {
        id,
      },
      data: {
        ...updateProductVariantDto,
      },
    });
  
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
      throw new Error(ProductKeys.ONLY_ADMIN);
    }
    const productVariantCheck = await this.prisma.productVariant.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
    if (!productVariantCheck) {
      throw new NotFoundException(ProductKeys.PRODUCT_VARIANT_NOT_FOUND);
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
      message: ProductKeys.PRODUCT_VARIANT_DELETED,
    };
  }
}
