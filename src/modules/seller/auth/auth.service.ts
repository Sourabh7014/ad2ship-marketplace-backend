import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/database/prisma.service';
import { SellerRegisterDto } from './dto/register.dto';
import { SellerLoginDto } from './dto/login.dto';
import { ChangePasswordDto, CheckOldPasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SellerStatus, SellerOnboardingStatus, SoftDeleteStatus } from '@/common/enums/seller-status.enum';

@Injectable()
export class SellerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: SellerRegisterDto) {
    // 1. Check existing user
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }],
      },
    });

    if (existingUser) {
      return {
        status: false,
        message: 'A user with this email or phone already exists',
        data: null,
      };
    }

    // 2. Generate slug from display name or user name
    const displayName = dto.displayName?.trim() || dto.name.trim();
    const legalName = dto.legalName?.trim() || dto.name.trim();

    const baseSlug = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'seller';
    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.seller.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 4. Create user, seller, and linkage in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          passwordHash,
          role: 'seller',
          status: 0,
        },
      });

      const seller = await tx.seller.create({
        data: {
          legalName,
          displayName,
          slug,
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          status: SellerStatus.ACTIVE,
          onboardingStatus: SellerOnboardingStatus.DRAFT,
          riskStatus: 'NORMAL',
          softDelete: SoftDeleteStatus.ACTIVE,
        },
      });

      await tx.sellerUser.create({
        data: {
          sellerId: seller.id,
          userId: user.id,
          sellerRole: 'OWNER',
          status: 0,
          softDelete: 0,
        },
      });

      await tx.sellerOnboardingEvent.create({
        data: {
          sellerId: seller.id,
          eventType: 'REGISTERED',
          newStatus: 'DRAFT',
          actorId: user.id,
          reason: 'Seller account registered',
        },
      });

      return { user, seller };
    });

    const token = this.jwtService.sign({
      sub: result.user.id.toString(),
      email: result.user.email,
      sellerId: result.seller.id.toString(),
      role: 'OWNER',
    });

    return {
      status: true,
      message: 'Seller registered successfully',
      auth_token: token,
      data: {
        user: {
          id: result.user.id.toString(),
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
        },
        seller: {
          id: result.seller.id.toString(),
          legalName: result.seller.legalName,
          displayName: result.seller.displayName,
          slug: result.seller.slug,
          onboardingStatus: result.seller.onboardingStatus,
        },
      },
    };
  }

  async login(dto: SellerLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        sellerUsers: {
          include: {
            seller: true,
          },
        },
      },
    });

    if (!user) {
      return {
        status: false,
        message: 'Invalid email or password',
        data: null,
      };
    }

    if (user.status === 1) {
      return {
        status: false,
        message: 'Your account is inactive. Please contact support.',
        data: null,
      };
    }

    if (!user.passwordHash) {
      return {
        status: false,
        message: 'Password is not set for this account. Please login with OTP or set a password.',
        data: null,
      };
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      return {
        status: false,
        message: 'Invalid email or password',
        data: null,
      };
    }

    const sellerUser = user.sellerUsers[0];
    if (!sellerUser) {
      return {
        status: false,
        message: 'User is not associated with any seller account',
        data: null,
      };
    }

    const seller = sellerUser.seller;
    if (seller.status !== SellerStatus.ACTIVE) {
      return {
        status: false,
        message: 'Seller account is suspended or inactive',
        data: null,
      };
    }
    if (seller.softDelete === SoftDeleteStatus.DELETED) {
      return {
        status: false,
        message: 'Seller account has been deleted',
        data: null,
      };
    }

    const token = this.jwtService.sign({
      sub: user.id.toString(),
      email: user.email,
      sellerId: seller.id.toString(),
      role: sellerUser.sellerRole,
    });

    return {
      status: true,
      message: 'Login successful',
      auth_token: token,
      data: {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          sellerRole: sellerUser.sellerRole,
        },
        seller: {
          id: seller.id.toString(),
          legalName: seller.legalName,
          displayName: seller.displayName,
          slug: seller.slug,
          onboardingStatus: seller.onboardingStatus,
        },
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        sellerUsers: {
          include: {
            seller: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const sellerUser = user.sellerUsers[0];
    const seller = sellerUser?.seller;

    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
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
          }
        : null,
    };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        sellerUsers: {
          include: {
            seller: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const sellerUser = user.sellerUsers[0];
    const seller = sellerUser?.seller;

    await this.prisma.$transaction(async (tx) => {
      if (dto.name || dto.phone) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            ...(dto.name ? { name: dto.name } : {}),
            ...(dto.phone ? { phone: dto.phone } : {}),
          },
        });
      }

      if (dto.displayName && seller) {
        await tx.seller.update({
          where: { id: seller.id },
          data: { displayName: dto.displayName },
        });
      }
    });

    return this.getMe(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      return {
        status: false,
        message: 'User not found',
      };
    }

    if (!user.passwordHash) {
      return {
        status: false,
        message: 'No password is set for this account',
      };
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isMatch) {
      return {
        status: false,
        message: 'Current password does not match',
      };
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return {
      status: true,
      message: 'Password changed successfully',
    };
  }

  async checkOldPassword(userId: string, dto: CheckOldPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user || !user.passwordHash) {
      return { valid: false };
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    return { valid: isMatch };
  }
}

