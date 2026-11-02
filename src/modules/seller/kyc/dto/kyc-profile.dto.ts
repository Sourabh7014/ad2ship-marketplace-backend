import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class KycProfileDto {
  @IsNotEmpty()
  @IsString()
  legalName!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsOptional()
  @IsString()
  gstin?: string;
}
