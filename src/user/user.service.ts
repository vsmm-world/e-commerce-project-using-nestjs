import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Session,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserKeys } from 'src/shared/keys/user.keys';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto;
    const hash = await bcrypt.hash(password, 10);

    if (role === 'admin') {
      const customer = await this.prisma.customer.findFirst({
        where: { email, isDeleted: false },
      });
      if (customer) {
        throw new BadRequestException(UserKeys.USER_ALREADY_EXIST);
      }
      const admin = await this.prisma.admin.findFirst({
        where: { email, isDeleted: false },
      });
      if (admin) {
        throw new BadRequestException(UserKeys.USER_ALREADY_EXIST);
      }
      const newAdmin = await this.prisma.admin.create({
        data: {
          name,
          email,
        },
      });
      const cred = await this.prisma.adminCredential.create({
        data: {
          password: hash,
          admin: {
            connect: {
              id: newAdmin.id,
            },
          },
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: UserKeys.USER_CREATED,
        data: newAdmin,
        adminCred: cred,
      };
    }
    if (role === 'customer') {
      const admin = await this.prisma.admin.findFirst({
        where: { email, isDeleted: false },
      });
      if (admin) {
        throw new BadRequestException(UserKeys.USER_ALREADY_EXIST);
      }
      const user = await this.prisma.customer.findFirst({
        where: { email, isDeleted: false },
      });
      if (user) {
        throw new BadRequestException(UserKeys.USER_ALREADY_EXIST);
      }
      const newUser = await this.prisma.customer.create({
        data: {
          name,
          email,
        },
      });
      const cred = await this.prisma.customerCredential.create({
        data: {
          password: hash,
          customer: {
            connect: {
              id: newUser.id,
            },
          },
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: UserKeys.USER_CREATED,
        data: newUser,
        userCred: cred,
      };
    }
  }

  async findAll(req: any) {
    const { user } = req;
    const admin = await this.prisma.admin.findFirst({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });
    if (!admin) {
      throw new Error(UserKeys.ADMIN_ONLY);
    }
    const admins = await this.prisma.admin.findMany({
      where: { isDeleted: false },
    });

    const customers = await this.prisma.customer.findMany({
      where: { isDeleted: false },
    });

    if (admins[0] == null && customers[0] == null) {
      throw new NotFoundException(UserKeys.USER_NOT_FOUND);
    }
    return {
      statusCode: HttpStatus.OK,
      message: UserKeys.USER_FETCHED,
      admins: admins,
      customers: customers,
    };
  }

  async findOne(id: string, req: any) {
    const { user } = req;
    const admin = await this.prisma.admin.findFirst({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    if (!admin) {
      throw new Error(UserKeys.ADMIN_ONLY);
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: id, isDeleted: false },
    });
    if (!customer) {
      const admin = await this.prisma.admin.findUnique({
        where: { id: id, isDeleted: false },
      });
      if (!admin) {
        throw new NotFoundException(UserKeys.USER_NOT_FOUND);
      }
      return {
        statusCode: HttpStatus.OK,
        message: UserKeys.USER_FETCHED,
        user: admin,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: UserKeys.USER_FETCHED,
      user: customer,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, req: any) {
    const { user } = req;
    const admin = await this.prisma.admin.findFirst({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });
    if (!admin) {
      throw new Error(UserKeys.ADMIN_ONLY);
    }
    const customerCheck = await this.prisma.customer.findUnique({
      where: { id: id, isDeleted: false },
    });
    if (!customerCheck) {
      const adminCheck = await this.prisma.admin.findUnique({
        where: { id: id, isDeleted: false },
      });

      if (!adminCheck) {
        throw new NotFoundException(UserKeys.USER_NOT_FOUND);
      }
      const { name, email } = updateUserDto;
      return this.prisma.admin.update({
        where: { id },
        data: {
          name,
          email,
        },
      });
    }

    const { name, email } = updateUserDto;
    return this.prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
      },
    });
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const admin = await this.prisma.admin.findFirst({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });
    if (!admin) {
      throw new Error(UserKeys.ADMIN_ONLY);
    }
    const customerCheck = await this.prisma.customer.findUnique({
      where: { id: id, isDeleted: false },
    });
    if (!customerCheck) {
      const adminCheck = await this.prisma.admin.findUnique({
        where: { id: id, isDeleted: false },
      });

      if (!adminCheck) {
        throw new NotFoundException(UserKeys.USER_NOT_FOUND);
      }
      const admin = await this.prisma.admin.update({
        where: { id },
        data: {
          isDeleted: true,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: UserKeys.USER_DELETED,
      };
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: UserKeys.USER_DELETED,
    };
  }
}
