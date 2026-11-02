import { Module } from '@nestjs/common';
import { SellerKycController } from './kyc.controller';
import { SellerKycService } from './kyc.service';
import { SellerAuthModule } from '../auth/auth.module';

@Module({
  imports: [SellerAuthModule],
  controllers: [SellerKycController],
  providers: [SellerKycService],
  exports: [SellerKycService],
})
export class SellerKycModule {}

