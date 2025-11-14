// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly primaService: PrismaService
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET as string,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }

  async validate(payload: JwtPayload) {
    const { username } = payload;
    const user = await this.primaService.user.findUnique({ 
      where: { username } 
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
