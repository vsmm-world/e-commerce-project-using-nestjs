import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto;
    if (role === 'admin') {
      const admin = await this.prisma.admin.findFirst({
        where: { email },
      });
      if (admin) {
        return {
          statusCode: 400,
          message: 'Email already exists',
        };
      }
      const newAdmin = await this.prisma.admin.create({
        data: {
          name,
          email,
        },
      });
      const cred = await this.prisma.adminCredential.create({
        data: {
          password,
          admin: {
            connect: {
              id: newAdmin.id,
            },
          },
        },
      });
      return newAdmin;
    }
    if (role === 'user') {
      const user = await this.prisma.customer.findFirst({
        where: { email },
      });
      if (user) {
        throw new Error('Email already exists');
      }
      const newUser = await this.prisma.customer.create({
        data: {
          name,
          email,
        },
      });
      const cred = await this.prisma.customerCredential.create({
        data: {
          password,
          customer: {
            connect: {
              id: newUser.id,
            },
          },
        },
      });

      return newUser;
    }
  }

  async findAll() {
    return await this.prisma.customer
      .findMany({
        where: { isdeleted: false },
      })
      .then((res) => {
        return {
          statusCode: 200,
          message: 'Success',
          data: res,
        };
      })
      .catch((err) => {
        return {
          statusCode: 400,
          message: err.message,
        };
      });
  }

  async findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
