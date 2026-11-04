import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

export const GENDER_ID_MAP: Record<number, string> = {
  1: 'Male',
  2: 'Female',
  3: 'Other',
};

export const GENDER_NAME_TO_ID: Record<string, number> = {
  male: 1,
  m: 1,
  female: 2,
  f: 2,
  other: 3,
  o: 3,
};

/**
 * Parses gender input into numeric ID (1: Male, 2: Female, 3: Other)
 */
export function parseGender(gender: any): number | null {
  if (gender === null || gender === undefined || gender === '') return null;
  if (typeof gender === 'number') {
    return [1, 2, 3].includes(gender) ? gender : null;
  }
  if (typeof gender === 'string') {
    const trimmed = gender.trim().toLowerCase();
    const asNum = parseInt(trimmed, 10);
    if (!isNaN(asNum) && [1, 2, 3].includes(asNum)) {
      return asNum;
    }
    return GENDER_NAME_TO_ID[trimmed] || null;
  }
  return null;
}

/**
 * Parses Date of Birth from Day-Month-Year (DD-MM-YYYY) or structured fields (date, month, year)
 */
export function parseDateOfBirth(
  dateOfBirth?: string | null,
  day?: number | string | null,
  month?: number | string | null,
  year?: number | string | null,
): Date | null {
  // If individual fields are provided: date, month, year
  if (
    day !== undefined &&
    day !== null &&
    month !== undefined &&
    month !== null &&
    year !== undefined &&
    year !== null
  ) {
    const d = parseInt(day.toString(), 10);
    const m = parseInt(month.toString(), 10);
    const y = parseInt(year.toString(), 10);
    if (
      !isNaN(d) &&
      !isNaN(m) &&
      !isNaN(y) &&
      d >= 1 &&
      d <= 31 &&
      m >= 1 &&
      m <= 12 &&
      y >= 1900 &&
      y <= 2100
    ) {
      return new Date(Date.UTC(y, m - 1, d));
    }
  }

  if (!dateOfBirth || typeof dateOfBirth !== 'string' || !dateOfBirth.trim()) {
    return null;
  }

  const trimmed = dateOfBirth.trim();

  // Match DD-MM-YYYY or DD/MM/YYYY (Day-Month-Year)
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);
    return new Date(Date.UTC(y, m - 1, d));
  }

  // Match YYYY-MM-DD or YYYY/MM/DD (Year-Month-Day fallback)
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10);
    const d = parseInt(ymdMatch[3], 10);
    return new Date(Date.UTC(y, m - 1, d));
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format DOB into Date-Month-Year string (DD-MM-YYYY)
 */
export function formatDateOfBirth(dob: Date | null): string | null {
  if (!dob) {
    return null;
  }
  const dateObj = new Date(dob);
  const d = String(dateObj.getUTCDate()).padStart(2, '0');
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const y = dateObj.getUTCFullYear();

  return `${d}-${m}-${y}`; // Date, Month, Year (DD-MM-YYYY)
}

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch current user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: BigInt(userId),
        softDelete: 0,
      },
      include: {
        _count: {
          select: {
            addresses: {
              where: { softDelete: 0 },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const genderId = user.gender !== null && user.gender !== undefined ? Number(user.gender) : null;

    return {
      status: true,
      statusCode: 200,
      message: 'Profile fetched successfully',
      data: {
        id: user.id.toString(),
        name: user.name || '',
        email: user.email || null,
        phone: user.phone || '',
        gender: genderId,
        dateOfBirth: formatDateOfBirth(user.dateOfBirth),
        alternatePhone: user.alternatePhone || null,
        role: user.role,
        savedAddressesCount: user._count.addresses,
        phoneVerifiedAt: user.phoneVerifiedAt,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Update profile (Myntra-style: name, email, gender ID, dob Date-Month-Year, alternate phone)
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: BigInt(userId),
        softDelete: 0,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    // If updating email, verify uniqueness
    if (dto.email && dto.email.trim().toLowerCase() !== user.email?.toLowerCase()) {
      const emailLower = dto.email.trim().toLowerCase();
      const emailInUse = await this.prisma.user.findFirst({
        where: {
          email: emailLower,
          softDelete: 0,
          NOT: { id: user.id },
        },
      });

      if (emailInUse) {
        throw new ConflictException('This email is already in use by another account');
      }
    }

    const dataToUpdate: any = {};

    if (dto.name !== undefined) {
      dataToUpdate.name = dto.name.trim();
    }
    if (dto.email !== undefined) {
      dataToUpdate.email = dto.email ? dto.email.trim().toLowerCase() : null;
    }
    if (dto.gender !== undefined) {
      dataToUpdate.gender = parseGender(dto.gender);
    }
    if (
      dto.dateOfBirth !== undefined ||
      dto.date !== undefined ||
      dto.month !== undefined ||
      dto.year !== undefined
    ) {
      dataToUpdate.dateOfBirth = parseDateOfBirth(
        dto.dateOfBirth,
        dto.date,
        dto.month,
        dto.year,
      );
    }
    if (dto.alternatePhone !== undefined) {
      dataToUpdate.alternatePhone = dto.alternatePhone ? dto.alternatePhone.trim() : null;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });

    const genderId = updatedUser.gender !== null && updatedUser.gender !== undefined ? Number(updatedUser.gender) : null;

    return {
      status: true,
      statusCode: 200,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id.toString(),
        name: updatedUser.name || '',
        email: updatedUser.email || null,
        phone: updatedUser.phone || '',
        gender: genderId,
        dateOfBirth: formatDateOfBirth(updatedUser.dateOfBirth),
        alternatePhone: updatedUser.alternatePhone || null,
        role: updatedUser.role,
        phoneVerifiedAt: updatedUser.phoneVerifiedAt,
        emailVerifiedAt: updatedUser.emailVerifiedAt,
        updatedAt: updatedUser.updatedAt,
      },
    };
  }

  /**
   * Delete account (Soft delete user, addresses, and revoke tokens)
   */
  async deleteAccount(userId: string, dto?: DeleteAccountDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: BigInt(userId),
        softDelete: 0,
      },
    });

    if (!user) {
      throw new NotFoundException('Account not found or already deleted');
    }

    const now = new Date();

    // Soft delete user, addresses, and revoke tokens
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          softDelete: 1,
          status: 1, // Inactive
          deletedAt: now,
        },
      }),
      this.prisma.userAddress.updateMany({
        where: {
          userId: user.id,
          softDelete: 0,
        },
        data: {
          softDelete: 1,
          deletedAt: now,
        },
      }),
      this.prisma.personalAccessToken.updateMany({
        where: {
          userId: user.id,
          status: 0,
        },
        data: {
          status: 1, // Expired / Revoked
        },
      }),
    ]);

    return {
      status: true,
      statusCode: 200,
      message: 'Your account has been deleted successfully',
      data: {
        deletedAt: now,
        reason: dto?.reason || null,
      },
    };
  }
}
