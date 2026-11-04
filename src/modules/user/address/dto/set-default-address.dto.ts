import { IsNotEmpty, IsOptional } from 'class-validator';

export class SetDefaultAddressDto {
  /**
   * Address ID (can be passed as `id` or `addressId`)
   * e.g. { "id": 1 } or { "id": "1" } or { "addressId": 1 }
   */
  @IsOptional()
  id?: string | number;

  @IsOptional()
  addressId?: string | number;
}

