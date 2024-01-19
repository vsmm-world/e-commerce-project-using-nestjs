import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProductKeys } from '../shared/keys/products.keys';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, req: any) {
    const { name, description, categoryId } = createProductDto;
    const { user } = req;

    const admin = await this.prisma.admin.findFirst({
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

    const product = await this.prisma.product.create({
      data: {
        name,
        description,
        category: { connect: { id: categoryId } },
      },
    });

    return {
      statusCode: 201,
      message: ProductKeys.PRODUCT_CREATED,
      data: product,
    };
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      where: {
        isDeleted: false,
      },
    });
    if (products[0] == null) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ProductKeys.PRODUCT_NOT_FOUND,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: ProductKeys.FETCHED_SUCCESSFULLY,
      data: products,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ProductKeys.PRODUCT_NOT_FOUND,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: ProductKeys.FETCHED_SUCCESSFULLY,
      data: product,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, req: any) {
    const { name, description, categoryId } = updateProductDto;
    const { user } = req;
    const admin = await this.prisma.admin.findFirst({
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

    const productchek = await this.prisma.product.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!productchek) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ProductKeys.PRODUCT_NOT_FOUND,
      };
    }

    const product = await this.prisma.product.update({
      where: {
        id: id,
        isDeleted: false,
      },
      data: {
        name,
        description,
        category: { connect: { id: categoryId } },
      },
    });
    return {
      statusCode: HttpStatus.OK,
      message: ProductKeys.PRODUCT_UPDATED,
      data: product,
    };
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const admin = await this.prisma.admin.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!admin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ProductKeys.ONLY_ADMIN,
      };
    }

    const productchek = await this.prisma.product.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!productchek) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ProductKeys.PRODUCT_NOT_FOUND,
      };
    }

    const product = this.prisma.product.update({
      where: {
        id: id,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: ProductKeys.PRODUCT_DELETED,
      data: product,
    };
  }
}
