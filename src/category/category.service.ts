import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryKeys } from 'src/shared/keys/category.keys';

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
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: CategoryKeys.ONLY_ADMIN,
      };
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
    const category = await this.prisma.category.findMany({
      where: { isDeleted: false },
    });
    if (category[0] == null) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: CategoryKeys.CATEGORY_NOT_FOUND,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: CategoryKeys.FETCHED_SUCCESSFULLY,
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
        message: CategoryKeys.CATEGORY_NOT_FOUND,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: CategoryKeys.FETCHED_SUCCESSFULLY,
      data: category,
    };
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
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: CategoryKeys.ONLY_ADMIN,
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
        message: CategoryKeys.CATEGORY_NOT_FOUND,
      };
    }
    const category = await this.prisma.category.update({
      where: {
        id: id,
        isDeleted: false,
      },
      data: {
        ...updateCategoryDto,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: CategoryKeys.CATEGORY_UPDATED,
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
        message: CategoryKeys.ONLY_ADMIN,
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
        message: CategoryKeys.CATEGORY_NOT_FOUND,
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
      message: CategoryKeys.CATEGORY_DELETED,
    };
  }
}
