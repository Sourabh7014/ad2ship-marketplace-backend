import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class KycWarehouseDto {
  @IsOptional()
  @IsString()
  warehouseName?: string;

  @IsNotEmpty()
  @IsString()
  contactPerson!: string;

  @IsNotEmpty()
  @IsString()
  contactPhone!: string;

  @IsNotEmpty()
  @IsString()
  addressLine1!: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsNotEmpty()
  @IsString()
  city!: string;

  @IsNotEmpty()
  @IsString()
  state!: string;

  @IsNotEmpty()
  @IsString()
  pincode!: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
