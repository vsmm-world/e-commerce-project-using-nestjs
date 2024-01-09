import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as postmark from 'postmark';
import * as otpGenerator from 'otp-generator';
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';

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
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpRef = otpGenerator.generate(6, {
            upperCase: false,
            specialChars: false,
            alphabets: false,
          });
          await this.prisma.tempotp.create({
            data: {
              tempId: admin.id,
              otp,
              otpRef,
              expiresAt: new Date(Date.now() + 2 * 60 * 600000),
            },
          });
          const client = new postmark.ServerClient(env.POST_MARK_API_KEY);

          const mail = {
            TemplateId: 34277244,

            TemplateModel: {
              otp: otp,
            },
            From: 'rushi@syscreations.com',
            To: admin.email,
          };

          client.sendEmailWithTemplate(mail).catch((err) => {
            throw new Error('Error sending email');
          });

          return {
            statusCode: 200,
            message: 'OTP sent successfully',
            otpRef,
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
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpRef = otpGenerator.generate(6, {
            upperCase: false,
            specialChars: false,
            alphabets: false,
          });

          await this.prisma.tempotp.create({
            data: {
              tempId: customer.id,
              otp,
              otpRef,
              expiresAt: new Date(Date.now() + 2 * 60 * 600000),
            },
          });
          const client = new postmark.ServerClient(env.POST_MARK_API_KEY);

          const mail = {
            TemplateId: 34277244,

            TemplateModel: {
              otp: otp,
            },
            From: 'rushi@syscreations.com',
            To: customer.email,
          };
          client.sendEmailWithTemplate(mail).catch((err) => {
            throw new Error('Error sending email');
          });

          return {
            statusCode: 200,
            message: 'OTP sent successfully',
            otpRef,
          };
        }
      }
    }
    return {
      statusCode: 400,
      message: 'Invalid credentials',
    };
  }

  async validateOtp(validateOtp) {
    const { otp, otpRef } = validateOtp;
    const tempOtp = await this.prisma.tempotp
      .findFirst({
        where: {
          otpRef,
          expiresAt: {
            gte: new Date(Date.now()),
          },
        },
      })
      .catch((err) => {
        throw new Error('Error validating otp');
      });

    if (tempOtp) {
      if (tempOtp.otp === otp) {
        const token = await this.generatejwtToken(tempOtp.tempId);

        const admin = await this.prisma.admin.findFirst({
          where: {
            id: tempOtp.tempId,
          },
        });
        if (admin) {
          const adminCred = await this.prisma.adminCredential.findFirst({
            where: {
              adminId: admin.id,
            },
          });
          if (adminCred) {
            await this.prisma.adminCredential.update({
              where: {
                id: adminCred.id,
              },
              data: {
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 600000),
              },
            });
            await this.prisma.tempotp.delete({
              where: {
                id: tempOtp.id,
              },
            });
            return {
              statusCode: 200,
              message: 'Login successful',
              token,
              admin,
            };
          }
        }

        const customer = await this.prisma.customer.findFirst({
          where: {
            id: tempOtp.tempId,
          },
        });
        if (customer) {
          const customerCred = await this.prisma.customerCredential.findFirst({
            where: {
              customerId: customer.id,
            },
          });
          if (customerCred) {
            await this.prisma.customerCredential.update({
              where: {
                id: customerCred.id,
              },
              data: {
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 600000),
              },
            });
            await this.prisma.tempotp.delete({
              where: {
                id: tempOtp.id,
              },
            });
            return {
              statusCode: 200,
              message: 'Login successful',
              token,
              customer,
            };
          }
        }
      }
    }
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
