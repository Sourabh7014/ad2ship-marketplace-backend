import { PrismaClient } from '@prisma/client';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial marketplace taxonomy and roles...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'Super Administrator',
      scopeType: 'GLOBAL',
    },
  });

  const sellerRole = await prisma.role.upsert({
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

  // 3. Departments (Fashion uses Men, Women, Kids per Blueprint §3)
  const menDept = await prisma.department.upsert({
    where: { slug: 'fashion-men' },
    update: {},
    create: { name: 'Men', slug: 'fashion-men', sortOrder: 1 },
  });

  const womenDept = await prisma.department.upsert({
    where: { slug: 'fashion-women' },
    update: {},
    create: { name: 'Women', slug: 'fashion-women', sortOrder: 2 },
  });

  const kidsDept = await prisma.department.upsert({
    where: { slug: 'fashion-kids' },
    update: {},
    create: { name: 'Kids', slug: 'fashion-kids', sortOrder: 3 },
  });

  // 4. Sample Brands (Blueprint §3 & §4)
  const brands = [
    { name: 'Nike', slug: 'nike', description: 'Global athletic footwear and apparel' },
    { name: 'Puma', slug: 'puma', description: 'Sportstyle apparel and footwear' },
    { name: 'Lakmé', slug: 'lakme', description: 'Indian cosmetics and skincare' },
    { name: 'Samsung', slug: 'samsung', description: 'Consumer electronics and smartphones' },
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

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

