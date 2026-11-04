import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { AddressTypeEnum } from './create-address.dto';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+]?[0-9\s-]{10,15}$/, {
    message: 'Please provide a valid 10-digit mobile number',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[1-9][0-9]{5}$/, {
    message: 'Pincode must be a valid 6-digit Indian PIN code',
  })
  pincode?: string;

  @IsOptional()
  @IsString()
  @Length(3, 250, { message: 'Address line 1 must be between 3 and 250 characters' })
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @Length(0, 250)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @Length(0, 150)
  landmark?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(AddressTypeEnum, {
    message: 'Address type must be HOME, WORK, or OTHER',
  })
  addressType?: AddressTypeEnum;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

