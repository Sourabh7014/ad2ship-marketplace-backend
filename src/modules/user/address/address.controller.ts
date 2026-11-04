import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UserAddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { SetDefaultAddressDto } from './dto/set-default-address.dto';
import { DeleteAddressDto } from './dto/delete-address.dto';
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@UseGuards(UserJwtAuthGuard)
@Controller('user-api/addresses')
export class UserAddressController {
  constructor(private readonly addressService: UserAddressService) {}

  /**
   * List all saved addresses for user
   */
  @Get()
  async getAddresses(@CurrentUser() user: any) {
    return this.addressService.getAddresses(user.id);
  }

  /**
   * Get single address by id
   */
  @Get(':id')
  async getAddressById(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
  ) {
    return this.addressService.getAddressById(user.id, addressId);
  }

  /**
   * Add a new address (Myntra-style)
   */
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async createAddress(
    @CurrentUser() user: any,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.createAddress(user.id, dto);
  }

  /**
   * Update an address
   */
  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor())
  async updateAddress(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(user.id, addressId, dto);
  }

  /**
   * Update address (PUT alias)
   */
  @Put(':id')
  @UseInterceptors(AnyFilesInterceptor())
  async updateAddressPut(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(user.id, addressId, dto);
  }

  /**
   * Delete address
   * Method: POST
   * URL: /user-api/addresses/delete or /user-api/addresses/remove
   * Body: { "id": 1 } or { "addressId": 1 }
   */
  @Post('delete')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async deleteAddressPost(
    @CurrentUser() user: any,
    @Body() dto: DeleteAddressDto,
  ) {
    const rawId = dto?.id !== undefined && dto?.id !== null ? dto.id : dto?.addressId;
    if (rawId === undefined || rawId === null || rawId === '') {
      throw new BadRequestException('Address ID is required in body (e.g. { "id": 1 })');
    }
    return this.addressService.deleteAddress(user.id, rawId.toString());
  }

  @Post('remove')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async deleteAddressPostAlias(
    @CurrentUser() user: any,
    @Body() dto: DeleteAddressDto,
  ) {
    const rawId = dto?.id !== undefined && dto?.id !== null ? dto.id : dto?.addressId;
    if (rawId === undefined || rawId === null || rawId === '') {
      throw new BadRequestException('Address ID is required in body (e.g. { "id": 1 })');
    }
    return this.addressService.deleteAddress(user.id, rawId.toString());
  }

  /**
   * Delete address (POST alias with URL param)
   * Method: POST /user-api/addresses/:id/delete
   */
  @Post(':id/delete')
  @HttpCode(HttpStatus.OK)
  async deleteAddressPostParam(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
  ) {
    return this.addressService.deleteAddress(user.id, addressId);
  }

  /**
   * Delete address (DELETE alias)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAddress(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
  ) {
    return this.addressService.deleteAddress(user.id, addressId);
  }

  /**
   * Set address as default
   * Method: POST
   * URL: /user-api/addresses/default or /user-api/addresses/set-default
   * Body: { "id": 1 } or { "addressId": 1 }
   */
  @Post('default')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async setDefaultAddressPost(
    @CurrentUser() user: any,
    @Body() dto: SetDefaultAddressDto,
  ) {
    const rawId = dto?.id !== undefined && dto?.id !== null ? dto.id : dto?.addressId;
    if (rawId === undefined || rawId === null || rawId === '') {
      throw new BadRequestException('Address ID is required in body (e.g. { "id": 1 })');
    }
    return this.addressService.setDefaultAddress(user.id, rawId.toString());
  }

  @Post('set-default')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async setDefaultAddressPostAlias(
    @CurrentUser() user: any,
    @Body() dto: SetDefaultAddressDto,
  ) {
    const rawId = dto?.id !== undefined && dto?.id !== null ? dto.id : dto?.addressId;
    if (rawId === undefined || rawId === null || rawId === '') {
      throw new BadRequestException('Address ID is required in body (e.g. { "id": 1 })');
    }
    return this.addressService.setDefaultAddress(user.id, rawId.toString());
  }

  /**
   * Set address as default (PATCH alias with URL param)
   */
  @Patch(':id/default')
  @HttpCode(HttpStatus.OK)
  async setDefaultAddress(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
  ) {
    return this.addressService.setDefaultAddress(user.id, addressId);
  }
}

