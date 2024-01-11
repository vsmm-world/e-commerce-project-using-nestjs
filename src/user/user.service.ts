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
      return {
        statusCode: 200,
        message: 'Admin created successfully',
        data: newAdmin,
        adminCred: cred,
      };
    }
    if (role === 'customer') {
      const user = await this.prisma.customer.findFirst({
        where: { email },
      });
      if (user) {
        return {
          statusCode: 400,
          message: 'Email already exists',
        };
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
        statusCode: 200,
        message: 'User created successfully',
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
        isdeleted: false,
      },
    });
    if (!admin) {
      return {
        statusCode: 400,
        message: 'Only admin can create category',
      };
    }
    const admins = await this.prisma.admin.findMany({
      where: { isdeleted: false },
    });

    const customers = await this.prisma.customer.findMany({
      where: { isdeleted: false },
    });

    if (admins[0] == null && customers[0] == null) {
      return {
        statusCode: 400,
        message: 'No users found',
      };
    }
    return {
      statusCode: 200,
      message: 'Users fetched successfully',
      admins: admins,
      customers: customers,
    };
  }

  async findOne(id: string, req: any) {
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
        message: 'Only admin can view user details',
      };
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: id, isdeleted: false },
    });
    if (!customer) {
      const admin = await this.prisma.admin.findUnique({
        where: { id: id, isdeleted: false },
      });
      if (!admin) {
        return {
          statusCode: 400,
          message: 'User not found',
        };
      }
      return {
        statusCode: 200,
        message: 'User found successfully',
        user: admin,
      };
    }
    return {
      statusCode: 200,
      message: 'User found successfully',
      user: customer,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, req: any) {
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
        message: 'Only admin can update user details',
      };
    }
    const customerCheck = await this.prisma.customer.findUnique({
      where: { id: id, isdeleted: false },
    });
    if (!customerCheck) {
      const adminCheck = await this.prisma.admin.findUnique({
        where: { id: id, isdeleted: false },
      });

      if (!adminCheck) {
        return {
          statusCode: 400,
          message: 'admin not found',
        };
      }
      const { name, email } = updateUserDto;
      const admin = await this.prisma.admin.update({
        where: { id },
        data: {
          name,
          email,
        },
      });
      return {
        statusCode: 200,
        message: 'User updated successfully',
        user: admin,
      };
    }

    const { name, email } = updateUserDto;
    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
      },
    });

    return {
      statusCode: 200,
      message: 'User updated successfully',
      user: customer,
    };
  }

  async remove(id: string, req: any) {
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
        message: 'Only admin can delete user',
      };
    }
    const customerCheck = await this.prisma.customer.findUnique({
      where: { id: id, isdeleted: false },
    });
    if (!customerCheck) {
      const adminCheck = await this.prisma.admin.findUnique({
        where: { id: id, isdeleted: false },
      });

      if (!adminCheck) {
        return {
          statusCode: 400,
          message: 'Admin not found',
        };
      }
      const admin = await this.prisma.admin.update({
        where: { id },
        data: {
          isdeleted: true,
        },
      });
      return {
        statusCode: 200,
        message: 'Admin deleted successfully',
      };
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        isdeleted: true,
      },
    });

    return {
      statusCode: 200,
      message: 'User deleted successfully',
    };
  }
}
