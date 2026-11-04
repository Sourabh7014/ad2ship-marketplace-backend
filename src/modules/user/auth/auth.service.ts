import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/database/prisma.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { formatDateOfBirth, GENDER_ID_MAP } from '../profile/profile.service';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Cleans and normalizes country code and phone number
   * Handles formats like countryCode: "+91", "91", phone: "9876543210", "+919876543210", "09876543210"
   */
  normalizePhone(phone: string, countryCode?: string): { phone: string; countryCode: string; fullPhone: string } {
    let cleanCode = countryCode ? countryCode.trim().replace(/[^0-9+]/g, '') : '+91';
    if (!cleanCode.startsWith('+')) {
      cleanCode = `+${cleanCode}`;
    }

    let cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    // If user typed the country code inside the phone field, strip it
    const codeDigits = cleanCode.replace('+', '');
    if (cleanPhone.startsWith(codeDigits) && cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(codeDigits.length);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }

    const fullPhone = `${cleanCode}${cleanPhone}`;
    return { phone: cleanPhone, countryCode: cleanCode, fullPhone };
  }

  /**
   * Generates a 6-digit OTP
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP for login / registration
   */
  async sendOtp(dto: SendOtpDto) {
    const { phone, countryCode, fullPhone } = this.normalizePhone(dto.phone, dto.countryCode);
    if (!phone || phone.length < 7) {
      throw new BadRequestException('Please provide a valid mobile number');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone }, { phone: fullPhone }],
        softDelete: 0,
      },
    });

    const isNewUser = !existingUser;

    // Generate 6-digit OTP code (demo/dev friendly default or random)
    const otp = process.env.NODE_ENV === 'production' ? this.generateOtpCode() : '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Invalidate previous active unverified OTPs for this phone
    await this.prisma.otpVerification.updateMany({
      where: {
        OR: [{ phone }, { phone: fullPhone }],
        isVerified: false,
      },
      data: {
        isVerified: true,
      },
    });

    // Save new OTP record
    await this.prisma.otpVerification.create({
      data: {
        phone,
        otp,
        purpose: 'LOGIN_SIGNUP',
        expiresAt,
        isVerified: false,
        userId: existingUser ? existingUser.id : null,
      },
    });

    return {
      status: true,
      statusCode: 200,
      message: `OTP sent successfully to ${countryCode} ${phone}`,
      data: {
        countryCode,
        phone,
        fullPhone,
        isNewUser,
        otp, // included for app & web developers to test easily
        expiresInSeconds: 600,
      },
    };
  }

  /**
   * Verify OTP & Login or Register (Myntra-style)
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const { phone, countryCode, fullPhone } = this.normalizePhone(dto.phone, dto.countryCode);
    const inputOtp = dto.otp.trim();

    if (!phone || phone.length < 7) {
      throw new BadRequestException('Please provide a valid mobile number');
    }

    // Check OTP in database or master bypass OTP (123456)
    const validOtpRecord = await this.prisma.otpVerification.findFirst({
      where: {
        OR: [{ phone }, { phone: fullPhone }],
        otp: inputOtp,
        isVerified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const isMasterOtp = inputOtp === '123456';

    if (!validOtpRecord && !isMasterOtp) {
      return {
        status: false,
        statusCode: 400,
        message: 'Invalid or expired OTP. Please try again.',
        data: null,
      };
    }

    // Mark OTP as verified if matched in db
    if (validOtpRecord) {
      await this.prisma.otpVerification.update({
        where: { id: validOtpRecord.id },
        data: { isVerified: true },
      });
    }

    // Check if user already exists
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone }, { phone: fullPhone }],
      },
    });

    let isNewUser = false;

    if (!user) {
      // Create new user (Sign Up)
      user = await this.prisma.user.create({
        data: {
          phone,
          name: '',
          role: 'user',
          status: 0,
          softDelete: 0,
          phoneVerifiedAt: new Date(),
        },
      });
      isNewUser = true;
    } else {
      // Existing user (Login)
      // If user was soft deleted, reactivate account
      const updates: any = {};
      if (user.softDelete === 1 || user.status !== 0) {
        updates.softDelete = 0;
        updates.status = 0;
        updates.deletedAt = null;
      }
      if (!user.phoneVerifiedAt) {
        updates.phoneVerifiedAt = new Date();
      }

      if (Object.keys(updates).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    }

    // Expire previous active tokens for this user
    await this.prisma.personalAccessToken.updateMany({
      where: {
        userId: user.id,
        status: 0,
      },
      data: {
        status: 1, // Expired / revoked
      },
    });

    // Generate JWT token (Persistent marketplace session: 365 days)
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const token = this.jwtService.sign(
      {
        sub: user.id.toString(),
        phone: user.phone,
        role: user.role,
      },
      {
        expiresIn: '365d',
      },
    );

    // Save token in personal_access_tokens table
    await this.prisma.personalAccessToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        status: 0, // ACTIVE
      },
    });

    return {
      status: true,
      statusCode: 200,
      message: isNewUser ? 'User registered successfully' : 'Login successful',
      data: {
        countryCode,
        isNewUser,
        token,
        user: this.formatUser(user),
      },
    };
  }

  /**
   * Logout - Revoke personal access token
   */
  async logout(userId: string, token?: string) {
    const userBigInt = BigInt(userId);

    if (token) {
      await this.prisma.personalAccessToken.updateMany({
        where: {
          userId: userBigInt,
          token,
          status: 0,
        },
        data: {
          status: 1, // Revoked/Expired
        },
      });
    } else {
      await this.prisma.personalAccessToken.updateMany({
        where: {
          userId: userBigInt,
          status: 0,
        },
        data: {
          status: 1,
        },
      });
    }

    return {
      status: true,
      message: 'Logged out successfully',
      data: null,
    };
  }

  /**
   * Resend OTP
   */
  async resendOtp(dto: ResendOtpDto) {
    return this.sendOtp({ phone: dto.phone, countryCode: dto.countryCode });
  }

  /**
   * Helper to format User entity for responses
   */
  formatUser(user: any) {
    if (!user) return null;
    const genderId = user.gender !== null && user.gender !== undefined ? Number(user.gender) : null;

    return {
      id: user.id.toString(),
      name: user.name || '',
      email: user.email || null,
      phone: user.phone || '',
      gender: genderId,
      dateOfBirth: formatDateOfBirth(user.dateOfBirth),
      alternatePhone: user.alternatePhone || null,
      role: user.role,
      phoneVerifiedAt: user.phoneVerifiedAt,
      emailVerifiedAt: user.emailVerifiedAt,
      hasPassword: !!user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
