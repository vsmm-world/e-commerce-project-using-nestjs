import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, req: any) {
    const { name, description, categoryId } = createProductDto;
    const { user } = req;

    const admin = await this.prisma.admin.findFirst({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });

    if (!admin) {
      return {
        statusCode: 400,
        message: 'Only admin can create product',
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
      message: 'Product created successfully',
      data: product,
    };
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      where: {
        isdeleted: false,
      },
    });
    if (products[0] == null) {
      return {
        statusCode: 400,
        message: 'Products not found',
      };
    }

    return {
      statusCode: 200,
      message: 'Products retrieved successfully',
      data: products,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: id,
        isdeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: 400,
        message: 'Product not found',
      };
    }
    return {
      statusCode: 200,
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, req: any) {
    const { name, description, categoryId } = updateProductDto;
    const { user } = req;
    const admin = await this.prisma.admin.findFirst({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });

    if (!admin) {
      return {
        statusCode: 400,
        message: 'Only admin can update product',
      };
    }

    const productchek = await this.prisma.product.findFirst({
      where: {
        id: id,
        isdeleted: false,
      },
    });

    if (!productchek) {
      return {
        statusCode: 400,
        message: 'Product not found',
      };
    }

    const product = await this.prisma.product.update({
      where: {
        id: id,
        isdeleted: false,
      },
      data: {
        name,
        description,
        category: { connect: { id: categoryId } },
      },
    });
    return {
      statusCode: 200,
      message: 'Product updated successfully',
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
        statusCode: 400,
        message: 'Only admin can delete product',
      };
    }

    const productchek = await this.prisma.product.findFirst({
      where: {
        id: id,
        isdeleted: false,
      },
    });

    if (!productchek) {
      return {
        statusCode: 400,
        message: 'Product not found',
      };
    }

    const product = this.prisma.product.update({
      where: {
        id: id,
        isdeleted: false,
      },
      data: {
        isdeleted: true,
      },
    });

    return {
      statusCode: 200,
      message: 'Product deleted successfully',
      data: product,
    };
  }
}
