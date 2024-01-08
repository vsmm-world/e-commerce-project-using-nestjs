import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'RavindraValand',
    });
  }

  async validate(payload: { sub: string }, req) {
    if (!payload) throw new UnauthorizedException();
    const admin = await this.prisma.admin
      .findUnique({
        where: { id: payload.sub },
      })
      .catch((err) => {
        throw new UnauthorizedException();
      });
    if (admin) {
      const adminCred = await this.prisma.adminCredential.findFirst({
        where: {
          adminId: admin.id,
          expiresAt: {
            gt: new Date(Date.now()),
          },
        },
      });
      if (adminCred) {
        req.user = admin;
        return admin;
      } else {
        throw new UnauthorizedException();
      }
    }

    const customer = await this.prisma.customer
      .findUnique({
        where: { id: payload.sub },
      })
      .catch((err) => {
        throw new UnauthorizedException();
      });
    if (customer) {
      const customerCred = await this.prisma.customerCredential.findFirst({
        where: {
          customerId: customer.id,
          expiresAt: {
            gt: new Date(Date.now()),
          },
        },
      });
      if (customerCred) {
        req.user = customer;
        return customer;
      } else {
        throw new UnauthorizedException();
      }
    }
  }
}
