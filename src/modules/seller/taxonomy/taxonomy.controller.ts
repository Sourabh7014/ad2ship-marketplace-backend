import { Controller, Get, Param, Query } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';

@Controller('seller-api/taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('domains')
  async getDomains() {
    const data = await this.taxonomyService.getDomains();
    return {
      status: true,
      message: 'Domains retrieved successfully',
      data,
    };
  }

  @Get('departments')
  async getDepartments(@Query('domainId') domainId?: string) {
    const data = await this.taxonomyService.getDepartments(domainId);
    return {
      status: true,
      message: 'Departments retrieved successfully',
      data,
    };
  }

  @Get('categories')
  async getCategories(
    @Query('domainId') domainId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('parentId') parentId?: string,
    @Query('level') level?: number,
  ) {
    const data = await this.taxonomyService.getCategories({ domainId, departmentId, parentId, level });
    return {
      status: true,
      message: 'Categories retrieved successfully',
      data,
    };
  }

  @Get('size-groups')
  async getSizeGroups(@Query('domainId') domainId?: string) {
    const data = await this.taxonomyService.getSizeGroups(domainId);
    return {
      status: true,
      message: 'Size groups retrieved successfully',
      data,
    };
  }

  @Get('categories/:id/sizes')
  async getCategorySizes(@Param('id') id: string) {
    const data = await this.taxonomyService.getCategorySizes(id);
    return {
      status: true,
      message: 'Category sizes retrieved successfully',
      data,
    };
  }

  @Get('hierarchy')
  async getHierarchy() {
    const data = await this.taxonomyService.getFullHierarchy();
    return {
      status: true,
      message: 'Full taxonomy hierarchy retrieved successfully',
      data,
    };
  }
}

