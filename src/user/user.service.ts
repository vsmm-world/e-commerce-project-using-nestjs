import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto;
    const hash = await bcrypt.hash(password, 10);

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
          password: hash,
          admin: {
            connect: {
              id: newAdmin.id,
            },
          },
        },
      });
      return newAdmin;
    }
    if (role === 'customer') {
      const user = await this.prisma.customer.findFirst({
        where: { email },
      });
      if (user) {
        throw new Error('Email already exists');
      }
      const newUser = await this.prisma.customer
        .create({
          data: {
            name,
            email,
          },
        })
        .catch((err) => {
          throw new Error('Error creating user');
        });
      const cred = await this.prisma.customerCredential
        .create({
          data: {
            password: hash,
            customer: {
              connect: {
                id: newUser.id,
              },
            },
          },
        })
        .catch((err) => {
          throw new Error('Error creating user');
        });

      return newUser;
    }
  }

  async findAll() {
    const users = await this.prisma.customer
      .findMany({
        where: { isdeleted: false },
      })
      .catch((err) => {
        return {
          statusCode: 400,
          message: err.message,
        };
      });
    if (!users) {
      return {
        statusCode: 400,
        message: 'No users found',
      };
    }
    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.customer
      .findUnique({
        where: { id },
      })
      .catch((err) => {
        throw new Error('User not found');
      });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { name, email, password } = updateUserDto;
    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.customer
      .update({
        where: { id },
        data: {
          name,
          email,
        },
      })
      .catch((err) => {
        throw new Error('User not found');
      });
  }

  async remove(id: string) {
    const user = await this.prisma.customer
      .update({
        where: { id },
        data: {
          isdeleted: true,
        },
      })
      .catch((err) => {
        throw new Error('User not found');
      });

    if (!user) {
      throw new Error('User not found');
    }
    return {
      statusCode: 200,
      message: 'User deleted successfully',
    };
  }
}
