import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SellerKycService } from './kyc.service';
import { KycProfileDto } from './dto/kyc-profile.dto';
import { KycDocumentDto } from './dto/kyc-document.dto';
import { KycAccountDto } from './dto/kyc-account.dto';
import { KycWarehouseDto } from './dto/kyc-warehouse.dto';
import { SellerJwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('seller-api/kyc')
export class SellerKycController {
  constructor(private readonly kycService: SellerKycService) {}

  @UseGuards(SellerJwtAuthGuard)
  @Post('profile')
  async saveProfile(@CurrentUser() user: any, @Body() dto: KycProfileDto) {
    if (!user.seller?.id) {
      throw new ForbiddenException('No seller account associated with user');
    }
    return this.kycService.saveProfile(user.seller.id, dto);
  }

  @UseGuards(SellerJwtAuthGuard)
  @Post('documents')
  async saveDocument(@CurrentUser() user: any, @Body() dto: KycDocumentDto) {
    if (!user.seller?.id) {
      throw new ForbiddenException('No seller account associated with user');
    }
    return this.kycService.saveDocument(user.seller.id, dto);
  }

  @UseGuards(SellerJwtAuthGuard)
  @Delete('documents/:documentType')
  async removeDocument(
    @CurrentUser() user: any,
    @Param('documentType') documentType: string,
  ) {
    if (!user.seller?.id) {
      throw new ForbiddenException('No seller account associated with user');
    }
    return this.kycService.removeDocument(user.seller.id, documentType);
  }

  @UseGuards(SellerJwtAuthGuard)
  @Post('account')
  async saveAccount(@CurrentUser() user: any, @Body() dto: KycAccountDto) {
    if (!user.seller?.id) {
      throw new ForbiddenException('No seller account associated with user');
    }
    return this.kycService.saveAccount(user.seller.id, dto);
  }

  @UseGuards(SellerJwtAuthGuard)
  @Post('warehouse')
  async saveWarehouse(@CurrentUser() user: any, @Body() dto: KycWarehouseDto) {
    if (!user.seller?.id) {
      throw new ForbiddenException('No seller account associated with user');
    }
    return this.kycService.saveWarehouse(user.seller.id, dto);
  }

  @UseGuards(SellerJwtAuthGuard)
  @Get('status')
  async getStatus(@CurrentUser() user: any) {
    if (!user.seller?.id) {
      throw new ForbiddenException('No seller account associated with user');
    }
    return this.kycService.getStatus(user.seller.id);
  }

  @UseGuards(SellerJwtAuthGuard)
  @Post('submit')
  async submitKyc(@CurrentUser() user: any) {
    if (!user.seller?.id) {
      throw new ForbiddenException('No seller account associated with user');
    }
    return this.kycService.submitKyc(user.seller.id, user.id);
  }

  @Get('pincode/:pincode')
  async getPincodeInfo(@Param('pincode') pincode: string) {
    return this.kycService.getPincodeInfo(pincode);
  }
}

