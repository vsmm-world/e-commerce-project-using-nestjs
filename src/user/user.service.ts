import { HttpStatus, Injectable, Session } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { session } from 'passport';
import { userInfo } from 'os';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto;
    const hash = await bcrypt.hash(password, 10);

    if (role === 'admin') {
      const customer = await this.prisma.customer.findFirst({
        where: { email ,isDeleted:false},
      });
      if (customer) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email already exists',
        };
      }
      const admin = await this.prisma.admin.findFirst({
        where: { email ,isDeleted:false},
      });
      if (admin) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
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
        statusCode: HttpStatus.OK,
        message: 'Admin created successfully',
        data: newAdmin,
        adminCred: cred,
      };
    }
    if (role === 'customer') {
      const admin = await this.prisma.admin.findFirst({
        where: { email ,isDeleted:false},
      });
      if (admin) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email already exists',
        };
      }
      const user = await this.prisma.customer.findFirst({
        where: { email,isDeleted:false },
      });
      if (user) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
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
        statusCode: HttpStatus.OK,
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
        isDeleted: false,
      },
    });
    if (!admin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Only admin can create category',
      };
    }
    const admins = await this.prisma.admin.findMany({
      where: { isDeleted: false },
    });

    const customers = await this.prisma.customer.findMany({
      where: { isDeleted: false },
    });

    if (admins[0] == null && customers[0] == null) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No users found',
      };
    }
    return {
      statusCode: HttpStatus.OK,
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
        isDeleted: false,
      },
    });

    if (!admin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Only admin can view user details',
      };
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: id, isDeleted: false },
    });
    if (!customer) {
      const admin = await this.prisma.admin.findUnique({
        where: { id: id, isDeleted: false },
      });
      if (!admin) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'User not found',
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'User found successfully',
        user: admin,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'User found successfully',
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
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Only admin can update user details',
      };
    }
    const customerCheck = await this.prisma.customer.findUnique({
      where: { id: id, isDeleted: false },
    });
    if (!customerCheck) {
      const adminCheck = await this.prisma.admin.findUnique({
        where: { id: id, isDeleted: false },
      });

      if (!adminCheck) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
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
        statusCode: HttpStatus.OK,
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
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      user: customer,
    };
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
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Only admin can delete user',
      };
    }
    const customerCheck = await this.prisma.customer.findUnique({
      where: { id: id, isDeleted: false },
    });
    if (!customerCheck) {
      const adminCheck = await this.prisma.admin.findUnique({
        where: { id: id, isDeleted: false },
      });

      if (!adminCheck) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Admin not found',
        };
      }
      const admin = await this.prisma.admin.update({
        where: { id },
        data: {
          isDeleted: true,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Admin deleted successfully',
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
      message: 'User deleted successfully',
    };
  }
}
