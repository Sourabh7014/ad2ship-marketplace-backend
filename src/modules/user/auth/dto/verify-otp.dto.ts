import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsOptional()
  @IsString()
  @Matches(/^(\+)?[0-9]{1,4}$/, {
    message: 'Please provide a valid country code (e.g. +91 or 91)',
  })
  countryCode?: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Matches(/^[0-9\s-]{7,15}$/, {
    message: 'Please provide a valid mobile number',
  })
  phone: string;

  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  @Length(4, 8, { message: 'OTP must be between 4 and 8 digits' })
  otp: string;
}
