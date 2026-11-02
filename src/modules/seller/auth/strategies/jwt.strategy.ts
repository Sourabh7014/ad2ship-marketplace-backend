import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  sellerId?: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'seller-jwt') {
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
            token = req.cookies['seller_token'] || req.cookies['authToken'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'ad2ship_super_secret_jwt_key_2026_marketplace',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(payload.sub) },
      include: {
        sellerUsers: {
          include: {
            seller: true,
          },
        },
      },
    });

    if (!user || user.status !== 0) {
      throw new UnauthorizedException('User account is inactive or not found');
    }

    const sellerUser = user.sellerUsers[0];
    const seller = sellerUser ? sellerUser.seller : null;

    if (seller && (seller.status !== 0 || seller.softDelete === 1)) {
      throw new UnauthorizedException('Seller account is suspended or inactive');
    }

    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      sellerRole: sellerUser?.sellerRole || 'OWNER',
      seller: seller
        ? {
            id: seller.id.toString(),
            legalName: seller.legalName,
            displayName: seller.displayName,
            slug: seller.slug,
            email: seller.email,
            phone: seller.phone,
            status: seller.status,
            onboardingStatus: seller.onboardingStatus,
            riskStatus: seller.riskStatus,
            softDelete: seller.softDelete,
          }
        : null,
    };
  }
}

