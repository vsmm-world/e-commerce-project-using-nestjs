import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, req: any) {
    const { name } = createCategoryDto;
    const { user } = req;
    const admin = await this.prisma.admin
      .findFirst({
        where: {
          id: user.id,
        },
      })
      .catch((err) => {
        throw new Error('Error creating category');
      });
    if (admin) {
      await this.prisma.category
        .create({
          data: {
            name,
          },
        })
        .catch((err) => {
          throw new Error('Error creating category');
        });

      return {
        statusCode: 200,
        message: 'Category created successfully',
      };
    }
  }

  async findAll() {
    const category = await this.prisma.category
      .findMany({
        where: { isdeleted: false },
      })
      .catch((err) => {
        throw new Error('Error fetching category');
      });

    return {
      statusCode: 200,
      message: 'Category fetched successfully',
      data: category,
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category
      .findFirst({
        where: { id: id, isdeleted: false },
      })
      .catch((err) => {
        throw new Error('Error fetching category');
      });

    return {
      statusCode: 200,
      message: 'Category fetched successfully',
      data: category,
    };
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto, req: any) {
    const { name } = updateCategoryDto;
    const { user } = req;
    const admin = this.prisma.admin
      .findFirst({
        where: {
          id: user.id,
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error('Error updating category');
      });

    if (admin) {
      this.prisma.category
        .update({
          where: {
            id: id,
            isdeleted: false,
          },
          data: {
            name,
          },
        })
        .catch((err) => {
          throw new Error('Error updating category');
        });

      return {
        statusCode: 200,
        message: 'Category updated successfully',
      };
    }
  }

  remove(id: string, req: any) {
    const { user } = req;
    const admin = this.prisma.admin
      .findFirst({
        where: {
          id: user.id,
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error('Error deleting category');
      });

    if (admin) {
      this.prisma.category
        .update({
          where: {
            id: id,
            isdeleted: false,
          },
          data: {
            isdeleted: true,
          },
        })
        .catch((err) => {
          throw new Error('Error deleting category');
        });

      return {
        statusCode: 200,
        message: 'Category deleted successfully',
      };
    }
  }
}
