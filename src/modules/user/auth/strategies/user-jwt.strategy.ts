import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';

export interface UserJwtPayload {
  sub: string;
  phone?: string;
  email?: string;
  role?: string;
}

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['user_token'] || req.cookies['token'] || req.cookies['authToken'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'ad2ship_super_secret_jwt_key_2026_marketplace',
    });
  }

  async validate(req: any, payload: UserJwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const userId = BigInt(payload.sub);

    // Extract raw token from header or cookies
    let rawToken: string | null = null;
    const authHeader = req?.headers?.['authorization'] || req?.headers?.['Authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      rawToken = authHeader.substring(7).trim();
    } else if (req?.cookies) {
      rawToken = req.cookies['user_token'] || req.cookies['token'] || req.cookies['authToken'];
    }

    // Verify token exists and is active in personal_access_tokens table
    if (rawToken) {
      const tokenRecord = await this.prisma.personalAccessToken.findFirst({
        where: {
          token: rawToken,
          userId,
          status: 0,
          expiresAt: { gt: new Date() },
        },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Session expired or logged out. Please login again.');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status !== 0 || user.softDelete === 1) {
      throw new UnauthorizedException('Account not found, inactive, or has been deleted');
    }

    return {
      id: user.id.toString(),
      name: user.name || '',
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      alternatePhone: user.alternatePhone,
      role: user.role,
      token: rawToken,
      phoneVerifiedAt: user.phoneVerifiedAt,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
