import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'jwtSecretData.secret',
    });
  }

  async validate(payload: { sub: string }, req) {
    if (!payload) throw new UnauthorizedException();
    return await this.prisma.admin
      .findFirst({
        where: { id: payload.sub },
      })
      .then(async (res) => {
        return await this.prisma.adminCredential
          .findFirst({
            where: {
              adminId: payload.sub,
              expiresAt: {
                gte: new Date(Date.now()),
              },
            },
          })
          .then((session) => {
            if (!session) throw new UnauthorizedException();
            return res;
          });
      })
      .catch((err) => {
        throw new UnauthorizedException();
      });
  }
}
