import { Module } from '@nestjs/common';
import { UserAuthModule } from './auth/auth.module';
import { UserProfileModule } from './profile/profile.module';
import { UserAddressModule } from './address/address.module';

@Module({
  imports: [UserAuthModule, UserProfileModule, UserAddressModule],
  exports: [UserAuthModule, UserProfileModule, UserAddressModule],
})
export class UserModule {}

