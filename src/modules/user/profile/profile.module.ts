import { Module } from '@nestjs/common';
import { UserProfileController } from './profile.controller';
import { UserProfileService } from './profile.service';
import { UserAuthModule } from '../auth/auth.module';

@Module({
  imports: [UserAuthModule],
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}

