import { HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';
import { ProductKeys } from 'src/shared/keys/products.keys';

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
        message: ProductKeys.ONLY_ADMIN,
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
        message: ProductKeys.PRODUCT_NOT_FOUND,
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
      message: ProductKeys.PRODUCT_VARIANT_CREATED,
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
        message: ProductKeys.PRODUCT_VARIANT_NOT_FOUND,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: ProductKeys.PRODUCT_VARIANT_FETCHED_SUCCESSFULLY,
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
        message: ProductKeys.PRODUCT_VARIANT_NOT_FOUND,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: ProductKeys.PRODUCT_VARIANT_FETCHED_SUCCESSFULLY,
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
        message: ProductKeys.ONLY_ADMIN,
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
        message: ProductKeys.PRODUCT_VARIANT_NOT_FOUND,
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
      message: ProductKeys.PRODUCT_VARIANT_UPDATED,
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
        message: ProductKeys.ONLY_ADMIN,
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
        message: ProductKeys.PRODUCT_VARIANT_NOT_FOUND,
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
      message: ProductKeys.PRODUCT_VARIANT_DELETED,
    };
  }
}
