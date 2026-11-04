import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserAuthController } from './auth.controller';
import { UserAuthService } from './auth.service';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';
import { UserJwtAuthGuard } from './guards/user-jwt-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'user-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') ||
          'ad2ship_super_secret_jwt_key_2026_marketplace',
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '7d') as any,
        },
      }),
    }),
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, UserJwtStrategy, UserJwtAuthGuard],
  exports: [UserAuthService, UserJwtAuthGuard, JwtModule, PassportModule],
})
export class UserAuthModule {}

