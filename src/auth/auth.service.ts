import { HttpStatus, Injectable, Session } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as postmark from 'postmark';
import * as otpGenerator from 'otp-generator';
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthKeys } from '../shared/keys/auth.keys';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirPassword } = resetPasswordDto;
    const tempToken = await this.prisma.tempResetToken.findFirst({
      where: {
        token,
        expiresAt: {
          gte: new Date(Date.now()),
        },
      },
    });

    if (!tempToken) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: AuthKeys.INVALID_TOKEN,
      };
    }

    if (password !== confirPassword) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: AuthKeys.INVALID_CREDENTIALS,
      };
    }

    const admin = await this.prisma.admin.findFirst({
      where: {
        id: tempToken.tempId,
      },
    });
    if (!admin) {
      const customer = await this.prisma.customer.findFirst({
        where: {
          id: tempToken.tempId,
        },
      });
      if (!customer) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: AuthKeys.USER_NOT_FOUND,
        };
      }
      const customerCred = await this.prisma.customerCredential.findFirst({
        where: {
          customerId: customer.id,
        },
      });
      if (!customerCred) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: AuthKeys.USER_NOT_FOUND,
        };
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.prisma.customerCredential.update({
        where: {
          id: customerCred.id,
        },
        data: {
          password: hashedPassword,
        },
      });
      await this.prisma.tempResetToken.delete({
        where: {
          id: tempToken.id,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: AuthKeys.PASSWORD_CHANGED,
      };
    }
    const adminCred = await this.prisma.adminCredential.findFirst({
      where: {
        adminId: admin.id,
      },
    });
    if (!adminCred) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: AuthKeys.USER_NOT_FOUND,
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.adminCredential.update({
      where: {
        id: adminCred.id,
      },
      data: {
        password: hashedPassword,
      },
    });
    await this.prisma.tempResetToken.delete({
      where: {
        id: tempToken.id,
      },
    });
    return {
      statusCode: HttpStatus.OK,
      message: AuthKeys.PASSWORD_CHANGED,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgetPasswordDto) {
    const { email } = forgotPasswordDto;
    const customer = await this.prisma.customer.findFirst({
      where: {
        email,
      },
    });

    if (!customer) {
      const admin = await this.prisma.admin.findFirst({
        where: {
          email,
        },
      });
      if (!admin) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: AuthKeys.NOT_REGISTERD,
        };
      }
      const token = otpGenerator.generate(10, {
        upperCase: false,
        specialChars: false,
        alphabets: false,
      });

      try {
        await this.prisma.tempResetToken.create({
          data: {
            tempId: admin.id,
            token,
            expiresAt: new Date(Date.now() + 5 * 60 * 600000),
          },
        });
      } catch (err) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: AuthKeys.GONE_WRONG,
        };
      }
      const client = new postmark.ServerClient(env.POST_MARK_API_KEY);
      const mail = {
        From: 'rushi@syscreations.com',
        To: admin.email,
        Subject: 'Reset Password',
        TextBody: `Your reset password token is ${token}
        This token will expire in 5 minutes`,
      };

      try {
        await client.sendEmail(mail);
      } catch (err) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: AuthKeys.GONE_WRONG,
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: AuthKeys.TOKEN_SENT,
      };
    }

    const token = otpGenerator.generate(10, {
      upperCase: false,
      specialChars: false,
      alphabets: false,
    });

    try {
      await this.prisma.tempResetToken.create({
        data: {
          tempId: customer.id,
          token,
          expiresAt: new Date(Date.now() + 5 * 60 * 600000),
        },
      });
    } catch (err) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: AuthKeys.GONE_WRONG,
      };
    }
    const client = new postmark.ServerClient(env.POST_MARK_API_KEY);
    const mail = {
      From: 'rushi@syscreations.com',
      To: customer.email,
      Subject: 'Reset Password',
      TextBody: `Your reset password token is ${token}
      This token will expire in 5 minutes`,
    };

    try {
      await client.sendEmail(mail);
    } catch (err) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: AuthKeys.GONE_WRONG,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: AuthKeys.TOKEN_SENT,
    };
  }

  async whoami(req: any) {
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
      return {
        statusCode: HttpStatus.OK,
        message: AuthKeys.USER_FETCHED,
        admin,
        adminCred,
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
      return {
        statusCode: HttpStatus.OK,
        message: AuthKeys.USER_FETCHED,
        customer,
        customerCred,
      };
    }

    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: AuthKeys.USER_NOT_FOUND,
    };
  }

  async login(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;

    const admin = await this.prisma.admin.findFirst({
      where: {
        email,
        isDeleted: false,
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
          await this.prisma.tempOtp.create({
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

          client.sendEmailWithTemplate(mail);

          return {
            statusCode: HttpStatus.OK,
            message: AuthKeys.OTP_SENT,
            otpRef,
          };
        }
      }
    }

    const customer = await this.prisma.customer.findFirst({
      where: {
        email,
        isDeleted: false,
        status: 'active',
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

          await this.prisma.tempOtp.create({
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
          client.sendEmailWithTemplate(mail);
          return {
            statusCode: HttpStatus.OK,
            message: AuthKeys.OTP_SENT,
            otpRef,
          };
        }
      }
    }
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: AuthKeys.INVALID_CREDENTIALS,
    };
  }

  async validateOtp(validateOtp) {
    const { otp, otpRef } = validateOtp;
    const tempOtp = await this.prisma.tempOtp.findFirst({
      where: {
        otpRef,
        expiresAt: {
          gte: new Date(Date.now()),
        },
      },
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
            await this.prisma.tempOtp.delete({
              where: {
                id: tempOtp.id,
              },
            });
            return {
              statusCode: HttpStatus.OK,
              message: AuthKeys.LOGIN_SUCCESS,
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
              isDeleted: false,
            },
          });
          if (customerCred) {
            await this.prisma.customerCredential.update({
              where: {
                id: customerCred.id,
                isDeleted: false,
              },
              data: {
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 600000),
              },
            });
            await this.prisma.tempOtp.delete({
              where: {
                id: tempOtp.id,
              },
            });
            return {
              statusCode: HttpStatus.OK,
              message: AuthKeys.LOGIN_SUCCESS,
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

      await this.prisma.adminCredential.update({
        where: {
          id: adminCred.id,
        },
        data: {
          token: null,
          expiresAt: null,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: AuthKeys.LOGIN_SUCCESS,
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

      await this.prisma.customerCredential.update({
        where: {
          id: customerCred.id,
        },
        data: {
          token: null,
          expiresAt: null,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: AuthKeys.LOGIN_SUCCESS,
      };
    }
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: AuthKeys.NOT_LOGGED_IN,
    };
  }

  generatejwtToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }
}
