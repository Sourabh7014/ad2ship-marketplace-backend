import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UserAuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { UserJwtAuthGuard } from './guards/user-jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('user-api/auth')
export class UserAuthController {
  constructor(private readonly authService: UserAuthService) {}

  /**
   * Request OTP for mobile login/signup
   * Supports both application/json and multipart/form-data
   */
  @Post('send-otp')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  /**
   * Verify OTP to complete login or sign up
   * Supports both application/json and multipart/form-data
   */
  @Post('verify-otp')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  /**
   * Resend OTP
   * Supports both application/json and multipart/form-data
   */
  @Post('resend-otp')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  /**
   * Get logged-in user profile
   */
  @UseGuards(UserJwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return {
      status: true,
      message: 'User profile fetched successfully',
      data: user,
    };
  }

  /**
   * Logout
   */
  @UseGuards(UserJwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id, user.token);
  }
}

