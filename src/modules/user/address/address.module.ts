import { Module } from '@nestjs/common';
import { UserAddressController } from './address.controller';
import { UserAddressService } from './address.service';
import { UserAuthModule } from '../auth/auth.module';

@Module({
  imports: [UserAuthModule],
  controllers: [UserAddressController],
  providers: [UserAddressService],
  exports: [UserAddressService],
})
export class UserAddressModule {}

