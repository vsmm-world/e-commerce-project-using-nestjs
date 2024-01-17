import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, req: any) {
    const { name } = createCategoryDto;
    const { user } = req;
    const admin = await this.prisma.admin.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!admin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Only admin can create category',
      };
    }
    const category = await this.prisma.category.create({
      data: {
        name,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Category created successfully',
      data: category,
    };
  }

  async findAll() {
    const category = await this.prisma.category.findMany({
      where: { isDeleted: false },
    });
    if (category[0] == null) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Category not found',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Category fetched successfully',
      data: category,
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: id, isDeleted: false },
    });

    if (!category) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Category not found',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Category fetched successfully',
      data: category,
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, req: any) {
    const { name } = updateCategoryDto;
    const { user } = req;
    const admin = this.prisma.admin.findFirst({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    if (!admin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Only admin can update category',
      };
    }
    const chekCategory = await this.prisma.category.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!chekCategory) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Category not found',
      };
    }
    const category = await this.prisma.category.update({
      where: {
        id: id,
        isDeleted: false,
      },
      data: {
        name,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Category updated successfully',
      data: category,
    };
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const admin = this.prisma.admin.findFirst({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });
    if (!admin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Only admin can delete category',
      };
    }

    const chekCategory = await this.prisma.category.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!chekCategory) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Category not found',
      };
    }

    await this.prisma.category.update({
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
      message: 'Category deleted successfully',
    };
  }
}
