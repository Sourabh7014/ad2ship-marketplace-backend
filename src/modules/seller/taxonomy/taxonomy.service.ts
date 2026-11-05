import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

/**
 * Helper to serialize BigInt fields to String for JSON responses
 */
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      res[key] = serializeBigInt(obj[key]);
    }
    return res;
  }
  return obj;
}

@Injectable()
export class TaxonomyService {
  private readonly logger = new Logger(TaxonomyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all active shopping domains with their departments
   */
  async getDomains() {
    try {
      const domains = await this.prisma.domain.findMany({
        where: { status: 0, softDelete: 0 },
        orderBy: { sortOrder: 'asc' },
        include: {
          departments: {
            where: { status: 0, softDelete: 0 },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      return serializeBigInt(domains);
    } catch (err) {
      this.logger.warn(`getDomains fallback: ${(err as Error).message}`);
      return [];
    }
  }

  /**
   * Get departments, optionally filtered by domainId
   */
  async getDepartments(domainId?: string) {
    try {
      const where: any = { status: 0, softDelete: 0 };
      if (domainId) {
        where.domainId = BigInt(domainId);
      }
      const departments = await this.prisma.department.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
      });
      return serializeBigInt(departments);
    } catch (err) {
      this.logger.warn(`getDepartments fallback: ${(err as Error).message}`);
      return [];
    }
  }

  /**
   * Get categories, optionally filtered by domainId, departmentId, and parentId
   */
  async getCategories(params: { domainId?: string; departmentId?: string; parentId?: string; level?: number }) {
    try {
      const where: any = { status: 0, softDelete: 0 };
      if (params.domainId) where.domainId = BigInt(params.domainId);
      if (params.departmentId) where.departmentId = BigInt(params.departmentId);
      if (params.parentId !== undefined) {
        where.parentId = params.parentId ? BigInt(params.parentId) : null;
      }
      if (params.level) where.level = Number(params.level);

      const categories = await this.prisma.category.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            where: { status: 0, softDelete: 0 },
            orderBy: { sortOrder: 'asc' },
          },
          categorySizes: {
            where: { status: 0 },
            include: {
              sizeGroup: {
                include: {
                  sizes: {
                    where: { status: 0, softDelete: 0 },
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
        },
      });
      return serializeBigInt(categories);
    } catch (err) {
      this.logger.warn(`getCategories fallback: ${(err as Error).message}`);
      return [];
    }
  }

  /**
   * Get all size groups and their individual sizes
   */
  async getSizeGroups(domainId?: string) {
    try {
      const where: any = { status: 0, softDelete: 0 };
      if (domainId) where.domainId = BigInt(domainId);

      const groups = await this.prisma.sizeGroup.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        include: {
          sizes: {
            where: { status: 0, softDelete: 0 },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      return serializeBigInt(groups);
    } catch (err) {
      this.logger.warn(`getSizeGroups fallback: ${(err as Error).message}`);
      return [];
    }
  }

  /**
   * Get sizes applicable to a specific category or subcategory
   */
  async getCategorySizes(categoryId: string) {
    try {
      const catId = BigInt(categoryId);

      // Find direct mappings for this category
      const mappings = await this.prisma.categorySize.findMany({
        where: { categoryId: catId, status: 0 },
        include: {
          sizeGroup: {
            include: {
              sizes: {
                where: { status: 0, softDelete: 0 },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
          size: true,
        },
      });

      if (mappings.length > 0) {
        return serializeBigInt(mappings);
      }

      // If no direct mapping, check parent category
      const category = await this.prisma.category.findUnique({
        where: { id: catId },
        select: { parentId: true },
      });

      if (category?.parentId) {
        const parentMappings = await this.prisma.categorySize.findMany({
          where: { categoryId: category.parentId, status: 0 },
          include: {
            sizeGroup: {
              include: {
                sizes: {
                  where: { status: 0, softDelete: 0 },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
            size: true,
          },
        });
        if (parentMappings.length > 0) {
          return serializeBigInt(parentMappings);
        }
      }

      // Default to APPAREL_STANDARD if none found
      const defaultGroup = await this.prisma.sizeGroup.findFirst({
        where: { code: 'APPAREL_STANDARD', status: 0 },
        include: {
          sizes: {
            where: { status: 0, softDelete: 0 },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      return serializeBigInt(defaultGroup ? [{ sizeGroup: defaultGroup }] : []);
    } catch (err) {
      this.logger.warn(`getCategorySizes fallback: ${(err as Error).message}`);
      return [];
    }
  }

  /**
   * Get the complete navigation hierarchy (Domain -> Department -> Category -> Subcategory)
   */
  async getFullHierarchy() {
    try {
      const domains = await this.prisma.domain.findMany({
        where: { status: 0, softDelete: 0 },
        orderBy: { sortOrder: 'asc' },
        include: {
          departments: {
            where: { status: 0, softDelete: 0 },
            orderBy: { sortOrder: 'asc' },
            include: {
              categories: {
                where: { parentId: null, status: 0, softDelete: 0 },
                orderBy: { sortOrder: 'asc' },
                include: {
                  children: {
                    where: { status: 0, softDelete: 0 },
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
          categories: {
            where: { departmentId: null, parentId: null, status: 0, softDelete: 0 },
            orderBy: { sortOrder: 'asc' },
            include: {
              children: {
                where: { status: 0, softDelete: 0 },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      });
      return serializeBigInt(domains);
    } catch (err) {
      this.logger.warn(`getFullHierarchy fallback: ${(err as Error).message}`);
      return [];
    }
  }
}

