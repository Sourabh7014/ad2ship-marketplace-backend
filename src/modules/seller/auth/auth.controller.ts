import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SellerAuthService } from './auth.service';
import { SellerRegisterDto } from './dto/register.dto';
import { SellerLoginDto } from './dto/login.dto';
import { ChangePasswordDto, CheckOldPasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SellerJwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('seller-api/auth')
export class SellerAuthController {
  constructor(private readonly authService: SellerAuthService) {}

  @Post('register')
  async register(@Body() dto: SellerRegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: SellerLoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(SellerJwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }

  @UseGuards(SellerJwtAuthGuard)
  @Patch('me')
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateMe(user.id, dto);
  }

  @UseGuards(SellerJwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }

  @UseGuards(SellerJwtAuthGuard)
  @Post('check-old-password')
  @HttpCode(HttpStatus.OK)
  async checkOldPassword(@CurrentUser() user: any, @Body() dto: CheckOldPasswordDto) {
    return this.authService.checkOldPassword(user.id, dto);
  }
}

