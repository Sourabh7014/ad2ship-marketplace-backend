import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SellerAuthController } from './auth.controller';
import { SellerAuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SellerJwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'seller-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'ad2ship_super_secret_jwt_key_2026_marketplace',
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '7d') as any,
        },
      }),
    }),
  ],
  controllers: [SellerAuthController],
  providers: [SellerAuthService, JwtStrategy, SellerJwtAuthGuard],
  exports: [SellerAuthService, SellerJwtAuthGuard],
})
export class SellerAuthModule {}
