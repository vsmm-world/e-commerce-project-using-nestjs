import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryKeys } from '../shared/keys/category.keys';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, req: any) {
    const { user } = req;
    const admin = await this.prisma.admin.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!admin) {
      throw new Error(CategoryKeys.ONLY_ADMIN);
    }
    const category = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: CategoryKeys.CATEGORY_CREATED,
      data: category,
    };
  }

  async findAll() {
    return this.prisma.category.findMany({
      where: { isDeleted: false },
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findFirst({
      where: { id: id, isDeleted: false },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, req: any) {
    const { user } = req;
    const admin = this.prisma.admin.findFirst({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    if (!admin) {
      throw new Error(CategoryKeys.ONLY_ADMIN);
    }
    const chekCategory = await this.prisma.category.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!chekCategory) {
      throw new Error(CategoryKeys.CATEGORY_NOT_FOUND);
    }
    return this.prisma.category.update({
      where: {
        id: id,
        isDeleted: false,
      },
      data: {
        ...updateCategoryDto,
      },
    });
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
      throw new Error(CategoryKeys.ONLY_ADMIN);
    }

    const chekCategory = await this.prisma.category.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!chekCategory) {
      throw new Error(CategoryKeys.CATEGORY_NOT_FOUND);
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
      message: CategoryKeys.CATEGORY_DELETED,
    };
  }
}
