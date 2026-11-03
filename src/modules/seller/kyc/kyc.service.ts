import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { KycProfileDto } from './dto/kyc-profile.dto';
import { KycDocumentDto } from './dto/kyc-document.dto';
import { KycAccountDto } from './dto/kyc-account.dto';
import { KycWarehouseDto } from './dto/kyc-warehouse.dto';
import { SellerOnboardingStatus } from '@/common/enums/seller-status.enum';

@Injectable()
export class SellerKycService {
  constructor(private readonly prisma: PrismaService) { }

  async saveProfile(sellerId: string, dto: KycProfileDto) {
    const seller = await this.prisma.seller.findUnique({
      where: { id: BigInt(sellerId) },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const updated = await this.prisma.seller.update({
      where: { id: BigInt(sellerId) },
      data: {
        legalName: dto.legalName,
        displayName: dto.displayName,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        businessType: dto.businessType || undefined,
        category: dto.category || undefined,
        pan: dto.panNumber ? dto.panNumber.toUpperCase().trim() : undefined,
        gstin: dto.gstin ? dto.gstin.toUpperCase().trim() : undefined,
      },
    });

    return {
      message: 'Business profile saved successfully',
      data: {
        id: updated.id.toString(),
        legalName: updated.legalName,
        displayName: updated.displayName,
        email: updated.email,
        phone: updated.phone,
        businessType: updated.businessType,
        category: updated.category,
        panNumber: updated.pan,
        gstin: updated.gstin,
        onboardingStatus: updated.onboardingStatus,
        onboardingFee: Number(updated.onboardingFee || 0),
      },
    };
  }

  async saveDocument(sellerId: string, dto: KycDocumentDto) {
    const seller = await this.prisma.seller.findUnique({
      where: { id: BigInt(sellerId) },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const existing = await this.prisma.sellerDocument.findFirst({
      where: {
        sellerId: BigInt(sellerId),
        documentType: dto.documentType,
      },
    });

    let doc;
    if (existing) {
      doc = await this.prisma.sellerDocument.update({
        where: { id: existing.id },
        data: {
          documentNumber: dto.documentNumber || existing.documentNumber,
          fileKey: dto.fileKey,
          verificationStatus: 'PENDING',
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : existing.expiryDate,
        },
      });
    } else {
      doc = await this.prisma.sellerDocument.create({
        data: {
          sellerId: BigInt(sellerId),
          documentType: dto.documentType,
          documentNumber: dto.documentNumber || null,
          fileKey: dto.fileKey,
          verificationStatus: 'PENDING',
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          status: 0,
          softDelete: 0,
        },
      });
    }

    return {
      message: 'Document uploaded successfully',
      data: {
        id: doc.id.toString(),
        documentType: doc.documentType,
        documentNumber: doc.documentNumber,
        fileKey: doc.fileKey,
        verificationStatus: doc.verificationStatus,
      },
    };
  }

  async removeDocument(sellerId: string, documentType: string) {
    const existing = await this.prisma.sellerDocument.findFirst({
      where: {
        sellerId: BigInt(sellerId),
        documentType,
      },
    });

    if (!existing) {
      throw new NotFoundException('Document not found');
    }

    await this.prisma.sellerDocument.delete({
      where: { id: existing.id },
    });

    return {
      message: `${documentType} removed successfully`,
    };
  }

  async saveAccount(sellerId: string, dto: KycAccountDto) {
    const seller = await this.prisma.seller.findUnique({
      where: { id: BigInt(sellerId) },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const cleanAcc = dto.accountNumber.trim();
    const masked =
      cleanAcc.length > 4
        ? `${'X'.repeat(cleanAcc.length - 4)}${cleanAcc.slice(-4)}`
        : cleanAcc;

    // Check if account already exists for this seller
    const existing = await this.prisma.sellerBankAccount.findFirst({
      where: { sellerId: BigInt(sellerId) },
    });

    let bankAccount;
    if (existing) {
      bankAccount = await this.prisma.sellerBankAccount.update({
        where: { id: existing.id },
        data: {
          beneficiaryName: dto.beneficiaryName,
          bankName: dto.bankName,
          accountNumberMasked: masked,
          accountNumberEncrypted: cleanAcc, // In production encrypt with KMS
          ifscCode: dto.ifscCode.toUpperCase(),
          accountType: dto.accountType || 'CURRENT',
          verificationStatus: 'PENDING',
        },
      });
    } else {
      bankAccount = await this.prisma.sellerBankAccount.create({
        data: {
          sellerId: BigInt(sellerId),
          beneficiaryName: dto.beneficiaryName,
          bankName: dto.bankName,
          accountNumberMasked: masked,
          accountNumberEncrypted: cleanAcc,
          ifscCode: dto.ifscCode.toUpperCase(),
          accountType: dto.accountType || 'CURRENT',
          verificationStatus: 'PENDING',
          isPrimary: true,
        },
      });
    }

    return {
      message: 'Bank account details saved successfully',
      data: {
        id: bankAccount.id.toString(),
        beneficiaryName: bankAccount.beneficiaryName,
        bankName: bankAccount.bankName,
        accountNumberMasked: bankAccount.accountNumberMasked,
        ifscCode: bankAccount.ifscCode,
        verificationStatus: bankAccount.verificationStatus,
      },
    };
  }

  async saveWarehouse(sellerId: string, dto: KycWarehouseDto) {
    const seller = await this.prisma.seller.findUnique({
      where: { id: BigInt(sellerId) },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    // Save as SellerAddress (PICKUP/WAREHOUSE)
    const address = await this.prisma.sellerAddress.create({
      data: {
        sellerId: BigInt(sellerId),
        addressType: 'WAREHOUSE',
        warehouseName: dto.warehouseName || `${seller.displayName} Primary Hub`,
        contactPerson: dto.contactPerson,
        contactPhone: dto.contactPhone,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2 || null,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        country: dto.country || 'IN',
        isDefault: dto.isDefault ?? true,
      },
    });

    // Also ensure a Warehouse record exists
    const code = `WH-${seller.slug.toUpperCase()}-${Date.now().toString().slice(-4)}`;
    await this.prisma.warehouse.create({
      data: {
        sellerId: BigInt(sellerId),
        name: `${seller.displayName} Primary Warehouse`,
        code,
        status: 0,
        softDelete: 0,
      },
    });

    return {
      message: 'Pickup / Warehouse address saved successfully',
      data: {
        id: address.id.toString(),
        contactPerson: address.contactPerson,
        contactPhone: address.contactPhone,
        addressLine1: address.addressLine1,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
    };
  }

  async getStatus(sellerId: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id: BigInt(sellerId) },
      include: {
        documents: true,
        bankAccounts: true,
        addresses: true,
        onboardingEvents: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const hasProfile = Boolean(seller.legalName && seller.displayName && seller.email && seller.phone);
    const hasDocuments = seller.documents.length > 0;
    const hasBank = seller.bankAccounts.length > 0;
    const hasWarehouse = seller.addresses.some((a) => a.addressType === 'WAREHOUSE' || a.addressType === 'PICKUP');

    const isComplete = hasProfile && hasDocuments && hasBank && hasWarehouse;

    return {
      onboardingStatus: seller.onboardingStatus,
      sellerStatus: seller.status,
      status: seller.status,
      onboardingFee: Number(seller.onboardingFee || 0),
      profile: {
        legalName: seller.legalName,
        displayName: seller.displayName,
        email: seller.email,
        phone: seller.phone,
        businessType: seller.businessType || 'PROPRIETORSHIP',
        category: seller.category || 'Fashion & Apparel',
        panNumber: seller.pan || '',
        gstin: seller.gstin || '',
        onboardingFee: Number(seller.onboardingFee || 0),
      },
      checklist: {
        profile: hasProfile,
        documents: hasDocuments,
        bankAccount: hasBank,
        warehouse: hasWarehouse,
        readyToSubmit: isComplete,
      },
      documents: seller.documents.map((d) => ({
        id: d.id.toString(),
        documentType: d.documentType,
        documentNumber: d.documentNumber,
        fileKey: d.fileKey,
        verificationStatus: d.verificationStatus,
      })),
      bankAccount: seller.bankAccounts[0]
        ? {
          id: seller.bankAccounts[0].id.toString(),
          beneficiaryName: seller.bankAccounts[0].beneficiaryName,
          bankName: seller.bankAccounts[0].bankName,
          accountNumber: seller.bankAccounts[0].accountNumberEncrypted,
          accountNumberMasked: seller.bankAccounts[0].accountNumberMasked,
          accountType: seller.bankAccounts[0].accountType || 'CURRENT',
          ifscCode: seller.bankAccounts[0].ifscCode,
          verificationStatus: seller.bankAccounts[0].verificationStatus,
        }
        : null,
      addresses: seller.addresses.map((a) => ({
        id: a.id.toString(),
        warehouseName: a.warehouseName,
        addressType: a.addressType,
        addressLine1: a.addressLine1,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
      })),
      recentEvents: seller.onboardingEvents.map((e) => ({
        id: e.id.toString(),
        eventType: e.eventType,
        newStatus: e.newStatus,
        reason: e.reason,
        createdAt: e.createdAt,
      })),
    };
  }

  async submitKyc(sellerId: string, actorId: string) {
    const status = await this.getStatus(sellerId);
    if (!status.checklist.readyToSubmit) {
      throw new BadRequestException(
        'Please complete all onboarding steps (Profile, Documents, Bank Account, Warehouse) before submitting.',
      );
    }

    const seller = await this.prisma.seller.findUnique({
      where: { id: BigInt(sellerId) },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const oldStatus = seller.onboardingStatus;
    const updated = await this.prisma.seller.update({
      where: { id: BigInt(sellerId) },
      data: {
        onboardingStatus: SellerOnboardingStatus.SUBMITTED,
      },
    });

    await this.prisma.sellerOnboardingEvent.create({
      data: {
        sellerId: BigInt(sellerId),
        eventType: 'KYC_SUBMITTED',
        oldStatus: String(oldStatus),
        newStatus: 'SUBMITTED',
        actorId: BigInt(actorId),
        reason: 'Seller submitted KYC documents for admin verification',
      },
    });

    return {
      message: 'KYC submitted successfully. Admin review is pending.',
      data: {
        onboardingStatus: updated.onboardingStatus,
      },
    };
  }

  async getPincodeInfo(pincode: string) {
    const cleanPincode = String(pincode || '').trim();
    if (!cleanPincode || cleanPincode.length < 6) {
      return {
        pincode: cleanPincode,
        city: '',
        state: '',
        serviceable: false,
        country: 'India',
      };
    }

    try {
      const records: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT city, state, picker_zone FROM zone_mapping WHERE pincode = $1 AND city IS NOT NULL AND state IS NOT NULL LIMIT 1`,
        cleanPincode,
      );

      if (records && records.length > 0 && records[0]) {
        const toTitleCase = (str: string) => {
          if (!str) return '';
          return str
            .toLowerCase()
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
        };

        return {
          pincode: cleanPincode,
          city: toTitleCase(records[0].city),
          state: toTitleCase(records[0].state),
          pickerZone: records[0].picker_zone || null,
          serviceable: true,
          country: 'India',
        };
      }
    } catch (err: any) {
      // In case zone_mapping table query fails
      return {
        pincode: cleanPincode,
        city: '',
        state: '',
        serviceable: false,
        country: 'India',
      };
    }

    return {
      pincode: cleanPincode,
      city: '',
      state: '',
      serviceable: false,
      country: 'India',
    };
  }
}
