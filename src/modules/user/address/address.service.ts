import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UserAddressService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all addresses for logged-in user (Default address first)
   */
  async getAddresses(userId: string) {
    const addresses = await this.prisma.userAddress.findMany({
      where: {
        userId: BigInt(userId),
        softDelete: 0,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return {
      status: true,
      message: 'Addresses fetched successfully',
      data: addresses.map((addr) => this.formatAddress(addr)),
    };
  }

  /**
   * Get a single address by ID
   */
  async getAddressById(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: {
        id: BigInt(addressId),
        userId: BigInt(userId),
        softDelete: 0,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return {
      status: true,
      message: 'Address fetched successfully',
      data: this.formatAddress(address),
    };
  }

  /**
   * Add a new address (Myntra-style)
   */
  async createAddress(userId: string, dto: CreateAddressDto) {
    const userBigInt = BigInt(userId);

    // Check count of existing active addresses
    const existingCount = await this.prisma.userAddress.count({
      where: {
        userId: userBigInt,
        softDelete: 0,
      },
    });

    // If first address or isDefault is true, set as default
    const shouldBeDefault = existingCount === 0 || !!dto.isDefault;

    const result = await this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault && existingCount > 0) {
        // Unset previous defaults
        await tx.userAddress.updateMany({
          where: {
            userId: userBigInt,
            isDefault: true,
            softDelete: 0,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.userAddress.create({
        data: {
          userId: userBigInt,
          name: dto.name.trim(),
          phone: dto.phone.trim(),
          pincode: dto.pincode.trim(),
          addressLine1: dto.addressLine1.trim(),
          addressLine2: dto.addressLine2 ? dto.addressLine2.trim() : null,
          landmark: dto.landmark ? dto.landmark.trim() : null,
          city: dto.city.trim(),
          state: dto.state.trim(),
          country: dto.country ? dto.country.trim() : 'IN',
          addressType: dto.addressType || 'HOME',
          isDefault: shouldBeDefault,
          status: 0,
          softDelete: 0,
        },
      });
    });

    return {
      status: true,
      message: 'Address added successfully',
      data: this.formatAddress(result),
    };
  }

  /**
   * Update an existing address
   */
  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const userBigInt = BigInt(userId);
    const addressBigInt = BigInt(addressId);

    const address = await this.prisma.userAddress.findFirst({
      where: {
        id: addressBigInt,
        userId: userBigInt,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.softDelete === 1) {
      throw new NotFoundException('Address is already deleted');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault === true && !address.isDefault) {
        // Unset other default addresses
        await tx.userAddress.updateMany({
          where: {
            userId: userBigInt,
            isDefault: true,
            softDelete: 0,
            NOT: { id: addressBigInt },
          },
          data: {
            isDefault: false,
          },
        });
      }

      const updateData: any = {};
      if (dto.name !== undefined) updateData.name = dto.name.trim();
      if (dto.phone !== undefined) updateData.phone = dto.phone.trim();
      if (dto.pincode !== undefined) updateData.pincode = dto.pincode.trim();
      if (dto.addressLine1 !== undefined) updateData.addressLine1 = dto.addressLine1.trim();
      if (dto.addressLine2 !== undefined) updateData.addressLine2 = dto.addressLine2 ? dto.addressLine2.trim() : null;
      if (dto.landmark !== undefined) updateData.landmark = dto.landmark ? dto.landmark.trim() : null;
      if (dto.city !== undefined) updateData.city = dto.city.trim();
      if (dto.state !== undefined) updateData.state = dto.state.trim();
      if (dto.country !== undefined) updateData.country = dto.country.trim();
      if (dto.addressType !== undefined) updateData.addressType = dto.addressType;
      if (dto.isDefault !== undefined) updateData.isDefault = dto.isDefault;

      return tx.userAddress.update({
        where: { id: addressBigInt },
        data: updateData,
      });
    });

    return {
      status: true,
      message: 'Address updated successfully',
      data: this.formatAddress(result),
    };
  }

  /**
   * Delete an address (Soft delete)
   */
  async deleteAddress(userId: string, addressId: string) {
    const userBigInt = BigInt(userId);
    const addressBigInt = BigInt(addressId);

    const address = await this.prisma.userAddress.findFirst({
      where: {
        id: addressBigInt,
        userId: userBigInt,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.softDelete === 1) {
      throw new NotFoundException('Address is already deleted');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userAddress.update({
        where: { id: addressBigInt },
        data: {
          softDelete: 1,
          deletedAt: new Date(),
        },
      });

      // If deleted address was default, make the most recent remaining address default
      if (address.isDefault) {
        const nextAddress = await tx.userAddress.findFirst({
          where: {
            userId: userBigInt,
            softDelete: 0,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (nextAddress) {
          await tx.userAddress.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return {
      status: true,
      message: 'Address deleted successfully',
      data: {
        id: addressId,
      },
    };
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(userId: string, addressId: string) {
    const userBigInt = BigInt(userId);
    const addressBigInt = BigInt(addressId);

    const address = await this.prisma.userAddress.findFirst({
      where: {
        id: addressBigInt,
        userId: userBigInt,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.softDelete === 1) {
      throw new NotFoundException('Address is already deleted');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Unset previous default
      await tx.userAddress.updateMany({
        where: {
          userId: userBigInt,
          isDefault: true,
          softDelete: 0,
        },
        data: {
          isDefault: false,
        },
      });

      return tx.userAddress.update({
        where: { id: addressBigInt },
        data: { isDefault: true },
      });
    });

    return {
      status: true,
      message: 'Default address updated successfully',
      data: this.formatAddress(updated),
    };
  }

  /**
   * Format UserAddress entity
   */
  private formatAddress(addr: any) {
    if (!addr) return null;
    return {
      id: addr.id.toString(),
      userId: addr.userId.toString(),
      name: addr.name,
      phone: addr.phone,
      pincode: addr.pincode,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || null,
      landmark: addr.landmark || null,
      city: addr.city,
      state: addr.state,
      country: addr.country || 'IN',
      addressType: addr.addressType,
      isDefault: addr.isDefault,
      createdAt: addr.createdAt,
      updatedAt: addr.updatedAt,
    };
  }
}

