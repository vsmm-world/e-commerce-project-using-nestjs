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

    const admin = await this.prisma.admin
      .findFirst({
        where: {
          id: user.id,
        },
      })
      .catch((err) => {
        throw new Error('Error creating product');
      });

    if (admin) {
      const product = await this.prisma.product
        .create({
          data: {
            name,
            description,
            category: { connect: { id: categoryId } },
          },
        })
        .catch((err) => {
          throw new Error('Error creating product');
        });

      return {
        statusCode: 201,
        message: 'Product created successfully',
        data: product,
      };
    } else {
      throw new Error('You are not authorized to perform this action');
    }
  }

  async findAll() {
    const products = await this.prisma.product
      .findMany({
        where: {
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error('Error fetching products');
      });

    return {
      statusCode: 200,
      message: 'Products retrieved successfully',
      data: products,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product
      .findFirst({
        where: {
          id: id,
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error('Error fetching product');
      });

    return {
      statusCode: 200,
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, req: any) {
    const { name, description, categoryId } = updateProductDto;
    const { user } = req;
    const admin = await this.prisma.admin
      .findFirst({
        where: {
          id: user.id,
        },
      })
      .catch((err) => {
        throw new Error('Error updating product');
      });

    if (admin) {
      const product = await this.prisma.product
        .update({
          where: {
            id: id,
          },
          data: {
            name,
            description,
            category: { connect: { id: categoryId } },
          },
        })
        .catch((err) => {
          throw new Error('Error updating product');
        });

      return {
        statusCode: 200,
        message: 'Product updated successfully',
        data: product,
      };
    }
  }

  remove(id: string, req: any) {
    const { user } = req;
    const admin = this.prisma.admin
      .findFirst({
        where: {
          id: user.id,
        },
      })
      .catch((err) => {
        throw new Error('Error deleting product');
      });

    if (admin) {
      const product = this.prisma.product
        .update({
          where: {
            id: id,
          },
          data: {
            isdeleted: true,
          },
        })
        .catch((err) => {
          throw new Error('Error deleting product');
        });

      return {
        statusCode: 200,
        message: 'Product deleted successfully',
        data: product,
      };
    }
  }
}
