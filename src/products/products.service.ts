import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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
      throw new Error(ProductKeys.ONLY_ADMIN);
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
    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
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
      throw new Error(ProductKeys.ONLY_ADMIN);
    }

    const productchek = await this.prisma.product.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!productchek) {
      throw new NotFoundException(ProductKeys.PRODUCT_NOT_FOUND);
    }

    return this.prisma.product.update({
      where: {
        id: id,
        isDeleted: false,
      },
      data: {
        name,
        description,
        categoryId: categoryId,
      },
    });
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const admin = await this.prisma.admin.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!admin) {
      throw new Error(ProductKeys.ONLY_ADMIN);
    }

    const productchek = await this.prisma.product.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!productchek) {
      throw new NotFoundException(ProductKeys.PRODUCT_NOT_FOUND);
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
    };
  }
}
