import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;

    const admin = await this.prisma.admin.findFirst({
      where: {
        email,
        isdeleted: false,
      },
    });
    if (admin) {
      const adminCred = await this.prisma.adminCredential.findFirst({
        where: {
          adminId: admin.id,
        },
      });
      if (adminCred) {
        const match = await bcrypt.compare(password, adminCred.password);
        if (match) {
          const token = this.generatejwtToken(admin.id);
          await this.prisma.adminCredential
            .update({
              where: {
                id: adminCred.id,
              },
              data: {
                token,
                expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              },
            })
            .catch((err) => {
              throw new Error('Error updating token');
            });
          return {
            statusCode: 200,
            message: 'Login successful',
            admin,
            token,
          };
        }
      }
    }

    const customer = await this.prisma.customer.findFirst({
      where: {
        email,
        isdeleted: false,
      },
    });
    if (customer) {
      const customerCred = await this.prisma.customerCredential.findFirst({
        where: {
          customerId: customer.id,
        },
      });
      if (customerCred) {
        const match = await bcrypt.compare(password, customerCred.password);
        if (match) {
          const token = this.generatejwtToken(customer.id);
          await this.prisma.customerCredential
            .update({
              where: {
                id: customerCred.id,
              },
              data: {
                token,
                expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              },
            })
            .catch((err) => {
              throw new Error('Error updating token');
            });

          return {
            statusCode: 200,
            message: 'Login successful',
            customer,
            token,
          };
        }
      }
    }
    return {
      statusCode: 400,
      message: 'Invalid credentials',
    };
  }

  async logout(req: any) {
    const { user } = req;

    const admin = await this.prisma.admin.findFirst({
      where: {
        id: user.id,
      },
    });

    if (admin) {
      const adminCred = await this.prisma.adminCredential.findFirst({
        where: {
          adminId: admin.id,
        },
      });

      await this.prisma.adminCredential
        .update({
          where: {
            id: adminCred.id,
          },
          data: {
            token: null,
            expiresAt: null,
          },
        })
        .catch((err) => {
          throw new Error('Error updating token');
        });
      return {
        statusCode: 200,
        message: 'Logout successful',
      };
    }

    const customer = await this.prisma.customer.findFirst({
      where: {
        id: user.id,
      },
    });

    if (customer) {
      const customerCred = await this.prisma.customerCredential.findFirst({
        where: {
          customerId: customer.id,
        },
      });

      await this.prisma.customerCredential
        .update({
          where: {
            id: customerCred.id,
          },
          data: {
            token: null,
            expiresAt: null,
          },
        })
        .catch((err) => {
          throw new Error('Error updating token');
        });
      return {
        statusCode: 200,
        message: 'Logout successful',
      };
    }
    return {
      statusCode: 400,
      message: 'Could not logout',
    };
  }

  generatejwtToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }
}
