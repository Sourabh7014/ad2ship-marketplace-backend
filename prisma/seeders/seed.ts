import { PrismaClient } from '@prisma/client';
import process from 'node:process';
import { seedTaxonomyAndSizes } from './seed_taxonomy';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial marketplace roles, permissions, brands, taxonomy and sizes...');

  // 1. Roles
  await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'Super Administrator',
      scopeType: 'GLOBAL',
    },
  });

  await prisma.role.upsert({
    where: { code: 'SELLER_ADMIN' },
    update: {},
    create: {
      code: 'SELLER_ADMIN',
      name: 'Seller Administrator',
      scopeType: 'SELLER',
    },
  });

  // 2. Permissions
  const permissions = [
    { code: 'seller.read', description: 'View seller details and KYC' },
    { code: 'seller.approve', description: 'Approve or reject seller KYC' },
    { code: 'catalog.create', description: 'Create canonical products and variants' },
    { code: 'catalog.approve', description: 'Approve or reject product submissions' },
    { code: 'listing.publish', description: 'Publish seller product offers' },
    { code: 'inventory.adjust', description: 'Adjust inventory balances' },
    { code: 'order.refund', description: 'Process order cancellations and refunds' },
    { code: 'payout.release', description: 'Release seller payout batches' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  // 3. Brands (Blueprint Section 3 & 4)
  const brands = [
    { name: 'Nike', slug: 'nike', description: 'Global athletic footwear and apparel' },
    { name: 'Puma', slug: 'puma', description: 'Sportstyle apparel and footwear' },
    { name: 'Lakmé', slug: 'lakme', description: 'Indian cosmetics and skincare' },
    { name: 'Samsung', slug: 'samsung', description: 'Consumer electronics and smartphones' },
    { name: 'Boat', slug: 'boat', description: 'Consumer audio and wearables' },
    { name: 'Zara', slug: 'zara', description: 'Global fast fashion apparel' },
  ];

  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        name: b.name,
        slug: b.slug,
        description: b.description,
        status: 0,
        softDelete: 0,
        verificationStatus: 'VERIFIED',
      },
    });
  }

  // 4. Domains, Departments, Categories, Size Groups & Sizes
  await seedTaxonomyAndSizes();

  console.log('✅ Entire seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
