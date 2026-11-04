import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UserProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@UseGuards(UserJwtAuthGuard)
@Controller('user-api')
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  /**
   * Get user profile details
   */
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.profileService.getProfile(user.id);
  }

  /**
   * Update profile details (Name, Email, Gender, DOB, Alternate Phone)
   * Method: POST
   */
  @Post('profile')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.id, dto);
  }

  /**
   * Update profile (PATCH alias)
   */
  @Patch('profile')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async updateProfilePatch(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.id, dto);
  }

  /**
   * Update profile (PUT alias)
   */
  @Put('profile')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async updateProfilePut(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.id, dto);
  }

  /**
   * Delete user account
   * Method: DELETE
   * URLs:
   *  - DELETE /user-api/profile
   *  - DELETE /user-api/account
   */
  @Delete('profile')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async deleteProfile(
    @CurrentUser() user: any,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.profileService.deleteAccount(user.id, dto);
  }

  /**
   * Delete account (alias endpoint: /user-api/account)
   */
  @Delete('account')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @CurrentUser() user: any,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.profileService.deleteAccount(user.id, dto);
  }
}

