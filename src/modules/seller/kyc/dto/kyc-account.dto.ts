import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class KycAccountDto {
  @IsNotEmpty()
  @IsString()
  beneficiaryName!: string;

  @IsNotEmpty()
  @IsString()
  bankName!: string;

  @IsNotEmpty()
  @IsString()
  accountNumber!: string;

  @IsNotEmpty()
  @IsString()
  ifscCode!: string;

  @IsOptional()
  @IsString()
  accountType?: string;
}
