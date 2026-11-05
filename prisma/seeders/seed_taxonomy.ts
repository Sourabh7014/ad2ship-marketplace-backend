import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTaxonomyAndSizes() {
  console.log('--- Starting Taxonomy & Sizes Import ---');

  // ====================================================
  // 1. Domains (4 core shopping domains per Blueprint)
  // ====================================================
  const domainsData = [
    {
      code: 'FASHION',
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, footwear, bags, and fashion accessories',
      sortOrder: 1,
    },
    {
      code: 'BEAUTY',
      name: 'Beauty & Personal Care',
      slug: 'beauty',
      description: 'Skincare, makeup, haircare, fragrances, and personal grooming',
      sortOrder: 2,
    },
    {
      code: 'HOME_LIVING',
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Furniture, home decor, bedding, kitchen and dining',
      sortOrder: 3,
    },
    {
      code: 'ELECTRONICS',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Mobiles, computers, audio, appliances and wearables',
      sortOrder: 4,
    },
  ];

  const domainMap = new Map<string, any>();
  for (const d of domainsData) {
    const domain = await prisma.domain.upsert({
      where: { slug: d.slug },
      update: { name: d.name, code: d.code, description: d.description, sortOrder: d.sortOrder },
      create: {
        code: d.code,
        name: d.name,
        slug: d.slug,
        description: d.description,
        sortOrder: d.sortOrder,
        status: 0,
      },
    });
    domainMap.set(d.code, domain);
    console.log(`Domain seeded: ${domain.name} (ID: ${domain.id})`);
  }

  // ====================================================
  // 2. Departments (Only Fashion uses Men, Women, Kids)
  // ====================================================
  const fashionDomain = domainMap.get('FASHION');
  const departmentsData = [
    {
      domainId: fashionDomain.id,
      name: 'Men',
      slug: 'fashion-men',
      code: 'MEN',
      sortOrder: 1,
    },
    {
      domainId: fashionDomain.id,
      name: 'Women',
      slug: 'fashion-women',
      code: 'WOMEN',
      sortOrder: 2,
    },
    {
      domainId: fashionDomain.id,
      name: 'Kids',
      slug: 'fashion-kids',
      code: 'KIDS',
      sortOrder: 3,
    },
  ];

  const deptMap = new Map<string, any>();
  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { slug: dept.slug },
      update: { name: dept.name, domainId: dept.domainId, code: dept.code, sortOrder: dept.sortOrder },
      create: {
        domainId: dept.domainId,
        name: dept.name,
        slug: dept.slug,
        code: dept.code,
        sortOrder: dept.sortOrder,
        status: 0,
      },
    });
    deptMap.set(dept.code, d);
    console.log(`Department seeded: ${d.name} under Fashion (ID: ${d.id})`);
  }

  // ====================================================
  // 3. Size Groups & Sizes
  // ====================================================
  const sizeGroupsData = [
    {
      code: 'APPAREL_STANDARD',
      name: 'Apparel (Standard / Tops)',
      description: 'Standard alpha sizes for shirts, t-shirts, dresses, jackets',
      sortOrder: 1,
      sizes: [
        { name: 'XS', code: 'XS', sortOrder: 1 },
        { name: 'S', code: 'S', sortOrder: 2 },
        { name: 'M', code: 'M', sortOrder: 3 },
        { name: 'L', code: 'L', sortOrder: 4 },
        { name: 'XL', code: 'XL', sortOrder: 5 },
        { name: 'XXL', code: 'XXL', sortOrder: 6 },
        { name: '3XL', code: '3XL', sortOrder: 7 },
        { name: '4XL', code: '4XL', sortOrder: 8 },
        { name: '5XL', code: '5XL', sortOrder: 9 },
      ],
    },
    {
      code: 'BOTTOMWEAR_WAIST',
      name: 'Bottomwear (Waist inches)',
      description: 'Waist circumference in inches for jeans, trousers, shorts',
      sortOrder: 2,
      sizes: [
        { name: '28', code: '28', sortOrder: 1 },
        { name: '30', code: '30', sortOrder: 2 },
        { name: '32', code: '32', sortOrder: 3 },
        { name: '34', code: '34', sortOrder: 4 },
        { name: '36', code: '36', sortOrder: 5 },
        { name: '38', code: '38', sortOrder: 6 },
        { name: '40', code: '40', sortOrder: 7 },
        { name: '42', code: '42', sortOrder: 8 },
      ],
    },
    {
      code: 'FOOTWEAR_UK',
      name: 'Footwear (UK / India)',
      description: 'Standard footwear sizes UK 5 through UK 12',
      sortOrder: 3,
      sizes: [
        { name: 'UK 5', code: 'UK-5', sortOrder: 1 },
        { name: 'UK 6', code: 'UK-6', sortOrder: 2 },
        { name: 'UK 7', code: 'UK-7', sortOrder: 3 },
        { name: 'UK 8', code: 'UK-8', sortOrder: 4 },
        { name: 'UK 9', code: 'UK-9', sortOrder: 5 },
        { name: 'UK 10', code: 'UK-10', sortOrder: 6 },
        { name: 'UK 11', code: 'UK-11', sortOrder: 7 },
        { name: 'UK 12', code: 'UK-12', sortOrder: 8 },
      ],
    },
    {
      code: 'KIDS_AGE',
      name: 'Kids Age Sizes',
      description: 'Infant months and growing kids age ranges',
      sortOrder: 4,
      sizes: [
        { name: '0-3M', code: '0-3M', sortOrder: 1 },
        { name: '3-6M', code: '3-6M', sortOrder: 2 },
        { name: '6-12M', code: '6-12M', sortOrder: 3 },
        { name: '1-2Y', code: '1-2Y', sortOrder: 4 },
        { name: '2-3Y', code: '2-3Y', sortOrder: 5 },
        { name: '3-4Y', code: '3-4Y', sortOrder: 6 },
        { name: '4-5Y', code: '4-5Y', sortOrder: 7 },
        { name: '5-6Y', code: '5-6Y', sortOrder: 8 },
        { name: '7-8Y', code: '7-8Y', sortOrder: 9 },
        { name: '9-10Y', code: '9-10Y', sortOrder: 10 },
        { name: '11-12Y', code: '11-12Y', sortOrder: 11 },
        { name: '13-14Y', code: '13-14Y', sortOrder: 12 },
      ],
    },
    {
      code: 'FREE_SIZE',
      name: 'Free Size / Universal',
      description: 'Single size or universal fitting products',
      sortOrder: 5,
      sizes: [
        { name: 'Free Size', code: 'FREE_SIZE', sortOrder: 1 },
        { name: 'One Size', code: 'ONE_SIZE', sortOrder: 2 },
      ],
    },
  ];

  const sizeGroupMap = new Map<string, any>();
  const sizeMap = new Map<string, any>();

  for (const sg of sizeGroupsData) {
    const group = await prisma.sizeGroup.upsert({
      where: { code: sg.code },
      update: { name: sg.name, description: sg.description, sortOrder: sg.sortOrder },
      create: {
        code: sg.code,
        name: sg.name,
        description: sg.description,
        sortOrder: sg.sortOrder,
        status: 0,
      },
    });
    sizeGroupMap.set(sg.code, group);
    console.log(`Size Group seeded: ${group.name}`);

    for (const s of sg.sizes) {
      const sizeRecord = await prisma.size.upsert({
        where: {
          sizeGroupId_code: {
            sizeGroupId: group.id,
            code: s.code,
          },
        },
        update: { name: s.name, sortOrder: s.sortOrder },
        create: {
          sizeGroupId: group.id,
          name: s.name,
          code: s.code,
          sortOrder: s.sortOrder,
          status: 0,
        },
      });
      sizeMap.set(`${sg.code}_${s.code}`, sizeRecord);
    }
  }

  // ====================================================
  // 4. Categories & Subcategories Hierarchy
  // ====================================================
  interface CategoryDef {
    name: string;
    slug: string;
    domainCode: string;
    departmentCode?: string;
    sizeGroupCode?: string;
    subcategories?: {
      name: string;
      slug: string;
      sizeGroupCode?: string;
    }[];
  }

  const categoryTree: CategoryDef[] = [
    // --- FASHION -> MEN ---
    {
      name: 'Men Clothing',
      slug: 'men-clothing',
      domainCode: 'FASHION',
      departmentCode: 'MEN',
      sizeGroupCode: 'APPAREL_STANDARD',
      subcategories: [
        { name: 'T-shirts', slug: 'men-t-shirts', sizeGroupCode: 'APPAREL_STANDARD' },
        { name: 'Casual Shirts', slug: 'men-casual-shirts', sizeGroupCode: 'APPAREL_STANDARD' },
        { name: 'Formal Shirts', slug: 'men-formal-shirts', sizeGroupCode: 'APPAREL_STANDARD' },
        { name: 'Jeans', slug: 'men-jeans', sizeGroupCode: 'BOTTOMWEAR_WAIST' },
        { name: 'Trousers & Chinos', slug: 'men-trousers', sizeGroupCode: 'BOTTOMWEAR_WAIST' },
        { name: 'Jackets & Blazers', slug: 'men-jackets', sizeGroupCode: 'APPAREL_STANDARD' },
        { name: 'Ethnic Wear & Kurtas', slug: 'men-ethnic', sizeGroupCode: 'APPAREL_STANDARD' },
        { name: 'Innerwear & Loungewear', slug: 'men-innerwear', sizeGroupCode: 'APPAREL_STANDARD' },
      ],
    },
    {
      name: 'Men Footwear',
      slug: 'men-footwear',
      domainCode: 'FASHION',
      departmentCode: 'MEN',
      sizeGroupCode: 'FOOTWEAR_UK',
      subcategories: [
        { name: 'Sneakers & Sports Shoes', slug: 'men-sneakers', sizeGroupCode: 'FOOTWEAR_UK' },
        { name: 'Formal Shoes', slug: 'men-formal-shoes', sizeGroupCode: 'FOOTWEAR_UK' },
        { name: 'Casual Shoes & Loafers', slug: 'men-casual-shoes', sizeGroupCode: 'FOOTWEAR_UK' },
        { name: 'Sandals & Floaters', slug: 'men-sandals', sizeGroupCode: 'FOOTWEAR_UK' },
      ],
    },
    {
      name: 'Men Accessories',
      slug: 'men-accessories',
      domainCode: 'FASHION',
      departmentCode: 'MEN',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: 'Belts', slug: 'men-belts', sizeGroupCode: 'BOTTOMWEAR_WAIST' },
        { name: 'Wallets', slug: 'men-wallets', sizeGroupCode: 'FREE_SIZE' },
        { name: 'Watches', slug: 'men-watches', sizeGroupCode: 'FREE_SIZE' },
        { name: 'Sunglasses', slug: 'men-sunglasses', sizeGroupCode: 'FREE_SIZE' },
      ],
    },

    // --- FASHION -> WOMEN ---
    {
      name: 'Women Clothing',
      slug: 'women-clothing',
      domainCode: 'FASHION',
      departmentCode: 'WOMEN',
      sizeGroupCode: 'APPAREL_STANDARD',
      subcategories: [
        { name: 'Kurtas & Kurti Sets', slug: 'women-kurtas', sizeGroupCode: 'APPAREL_STANDARD' },
        { name: 'Dresses & Jumpsuits', slug: 'women-dresses', sizeGroupCode: 'APPAREL_STANDARD' },
        { name: 'Tops, Tees & Shirts', slug: 'women-tops', sizeGroupCode: 'APPAREL_STANDARD' },
        { name: 'Sarees', slug: 'women-sarees', sizeGroupCode: 'FREE_SIZE' },
        { name: 'Jeans & Jeggings', slug: 'women-jeans', sizeGroupCode: 'BOTTOMWEAR_WAIST' },
        { name: 'Trousers & Palazzos', slug: 'women-trousers', sizeGroupCode: 'BOTTOMWEAR_WAIST' },
        { name: 'Co-ord Sets', slug: 'women-co-ords', sizeGroupCode: 'APPAREL_STANDARD' },
        { name: 'Skirts & Shorts', slug: 'women-skirts', sizeGroupCode: 'BOTTOMWEAR_WAIST' },
      ],
    },
    {
      name: 'Women Footwear',
      slug: 'women-footwear',
      domainCode: 'FASHION',
      departmentCode: 'WOMEN',
      sizeGroupCode: 'FOOTWEAR_UK',
      subcategories: [
        { name: 'Flats & Bellies', slug: 'women-flats', sizeGroupCode: 'FOOTWEAR_UK' },
        { name: 'Heels & Wedges', slug: 'women-heels', sizeGroupCode: 'FOOTWEAR_UK' },
        { name: 'Casual Shoes & Sneakers', slug: 'women-sneakers', sizeGroupCode: 'FOOTWEAR_UK' },
        { name: 'Ethnic Footwear & Juttis', slug: 'women-ethnic-shoes', sizeGroupCode: 'FOOTWEAR_UK' },
      ],
    },
    {
      name: 'Women Bags & Accessories',
      slug: 'women-bags-accessories',
      domainCode: 'FASHION',
      departmentCode: 'WOMEN',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: 'Handbags & Totes', slug: 'women-handbags', sizeGroupCode: 'FREE_SIZE' },
        { name: 'Clutches & Wallets', slug: 'women-clutches', sizeGroupCode: 'FREE_SIZE' },
        { name: 'Fashion Jewellery', slug: 'women-jewellery', sizeGroupCode: 'FREE_SIZE' },
        { name: 'Scarves & Stoles', slug: 'women-scarves', sizeGroupCode: 'FREE_SIZE' },
      ],
    },

    // --- FASHION -> KIDS ---
    {
      name: 'Boys Clothing',
      slug: 'boys-clothing',
      domainCode: 'FASHION',
      departmentCode: 'KIDS',
      sizeGroupCode: 'KIDS_AGE',
      subcategories: [
        { name: 'T-shirts & Polos', slug: 'boys-t-shirts', sizeGroupCode: 'KIDS_AGE' },
        { name: 'Shirts', slug: 'boys-shirts', sizeGroupCode: 'KIDS_AGE' },
        { name: 'Shorts & Jeans', slug: 'boys-bottoms', sizeGroupCode: 'KIDS_AGE' },
        { name: 'Ethnic Wear', slug: 'boys-ethnic', sizeGroupCode: 'KIDS_AGE' },
      ],
    },
    {
      name: 'Girls Clothing',
      slug: 'girls-clothing',
      domainCode: 'FASHION',
      departmentCode: 'KIDS',
      sizeGroupCode: 'KIDS_AGE',
      subcategories: [
        { name: 'Dresses & Frocks', slug: 'girls-dresses', sizeGroupCode: 'KIDS_AGE' },
        { name: 'Tops & Tees', slug: 'girls-tops', sizeGroupCode: 'KIDS_AGE' },
        { name: 'Sets & Rompers', slug: 'girls-sets', sizeGroupCode: 'KIDS_AGE' },
        { name: 'Ethnic Wear', slug: 'girls-ethnic', sizeGroupCode: 'KIDS_AGE' },
      ],
    },
    {
      name: 'Kids Footwear',
      slug: 'kids-footwear',
      domainCode: 'FASHION',
      departmentCode: 'KIDS',
      sizeGroupCode: 'FOOTWEAR_UK',
      subcategories: [
        { name: 'Kids Casual Shoes', slug: 'kids-casual-shoes', sizeGroupCode: 'FOOTWEAR_UK' },
        { name: 'Kids Sandals', slug: 'kids-sandals', sizeGroupCode: 'FOOTWEAR_UK' },
        { name: 'School Shoes', slug: 'kids-school-shoes', sizeGroupCode: 'FOOTWEAR_UK' },
      ],
    },

    // --- BEAUTY & PERSONAL CARE (Direct Domain -> Category -> Subcategory) ---
    {
      name: 'Skincare',
      slug: 'beauty-skincare',
      domainCode: 'BEAUTY',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: 'Face Wash & Cleansers', slug: 'beauty-face-wash' },
        { name: 'Moisturizers & Creams', slug: 'beauty-moisturizer' },
        { name: 'Sunscreen', slug: 'beauty-sunscreen' },
        { name: 'Face Serums', slug: 'beauty-serums' },
      ],
    },
    {
      name: 'Makeup',
      slug: 'beauty-makeup',
      domainCode: 'BEAUTY',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: 'Lipstick & Lip Care', slug: 'beauty-lipstick' },
        { name: 'Foundation & Concealer', slug: 'beauty-foundation' },
        { name: 'Kajal & Eyeliner', slug: 'beauty-eyeliner' },
        { name: 'Mascara', slug: 'beauty-mascara' },
      ],
    },
    {
      name: 'Haircare',
      slug: 'beauty-haircare',
      domainCode: 'BEAUTY',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: 'Shampoo & Cleansers', slug: 'beauty-shampoo' },
        { name: 'Conditioners & Masks', slug: 'beauty-conditioner' },
        { name: 'Hair Oils & Serums', slug: 'beauty-hair-oil' },
      ],
    },
    {
      name: 'Fragrances',
      slug: 'beauty-fragrances',
      domainCode: 'BEAUTY',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: "Men's Perfumes & Cologne", slug: 'fragrance-men' },
        { name: "Women's Perfumes & EDP", slug: 'fragrance-women' },
        { name: 'Body Deodorants', slug: 'fragrance-deo' },
      ],
    },

    // --- HOME & LIVING ---
    {
      name: 'Bedding & Furnishings',
      slug: 'home-bedding',
      domainCode: 'HOME_LIVING',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: 'Bedsheets & Pillow Covers', slug: 'home-bedsheets' },
        { name: 'Curtains & Drapes', slug: 'home-curtains' },
        { name: 'Cushions & Covers', slug: 'home-cushions' },
        { name: 'Blankets & Quilts', slug: 'home-blankets' },
      ],
    },
    {
      name: 'Kitchen & Dining',
      slug: 'home-kitchen',
      domainCode: 'HOME_LIVING',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: 'Cookware Sets', slug: 'home-cookware' },
        { name: 'Dinnerware & Crockery', slug: 'home-dinnerware' },
        { name: 'Storage Containers & Jars', slug: 'home-storage' },
        { name: 'Water Bottles & Flasks', slug: 'home-bottles' },
      ],
    },
    {
      name: 'Home Decor',
      slug: 'home-decor',
      domainCode: 'HOME_LIVING',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: 'Wall Art & Paintings', slug: 'home-wall-art' },
        { name: 'Wall Clocks', slug: 'home-clocks' },
        { name: 'Table Lamps & Lighting', slug: 'home-lighting' },
        { name: 'Vases & Planters', slug: 'home-vases' },
      ],
    },

    // --- ELECTRONICS ---
    {
      name: 'Mobiles & Accessories',
      slug: 'electronics-mobiles',
      domainCode: 'ELECTRONICS',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: 'Smartphones', slug: 'electronics-smartphones' },
        { name: 'Cases & Covers', slug: 'electronics-cases' },
        { name: 'Chargers & Cables', slug: 'electronics-chargers' },
      ],
    },
    {
      name: 'Audio & Wearables',
      slug: 'electronics-audio',
      domainCode: 'ELECTRONICS',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: 'Wireless Earbuds & TWS', slug: 'electronics-earbuds' },
        { name: 'Headphones & Headsets', slug: 'electronics-headphones' },
        { name: 'Smartwatches & Fitness Bands', slug: 'electronics-smartwatches' },
        { name: 'Bluetooth Speakers', slug: 'electronics-speakers' },
      ],
    },
    {
      name: 'Computer Accessories',
      slug: 'electronics-computing',
      domainCode: 'ELECTRONICS',
      sizeGroupCode: 'FREE_SIZE',
      subcategories: [
        { name: 'Keyboards & Mice', slug: 'electronics-keyboards' },
        { name: 'Laptop Bags & Sleeves', slug: 'electronics-laptop-bags' },
        { name: 'Storage Drives & Pen Drives', slug: 'electronics-storage' },
      ],
    },
  ];

  let catCount = 0;
  let subcatCount = 0;
  let mappingCount = 0;

  for (const catDef of categoryTree) {
    const domain = domainMap.get(catDef.domainCode);
    const dept = catDef.departmentCode ? deptMap.get(catDef.departmentCode) : null;

    // Create Level 1 Category
    const category = await prisma.category.upsert({
      where: {
        domainId_departmentId_parentId_slug: {
          domainId: domain.id,
          departmentId: dept ? dept.id : null as any,
          parentId: null as any,
          slug: catDef.slug,
        },
      },
      update: {
        name: catDef.name,
        level: 1,
      },
      create: {
        domainId: domain.id,
        departmentId: dept ? dept.id : null,
        parentId: null,
        name: catDef.name,
        slug: catDef.slug,
        level: 1,
        sortOrder: ++catCount,
        status: 0,
      },
    });

    // Map Category to SizeGroup if specified
    if (catDef.sizeGroupCode && sizeGroupMap.has(catDef.sizeGroupCode)) {
      const sg = sizeGroupMap.get(catDef.sizeGroupCode);
      await prisma.categorySize.upsert({
        where: {
          categoryId_sizeGroupId_sizeId: {
            categoryId: category.id,
            sizeGroupId: sg.id,
            sizeId: null as any,
          },
        },
        update: {},
        create: {
          categoryId: category.id,
          sizeGroupId: sg.id,
          isDefault: true,
          status: 0,
        },
      });
      mappingCount++;
    }

    // Create Subcategories (Level 2)
    if (catDef.subcategories && catDef.subcategories.length > 0) {
      for (const sub of catDef.subcategories) {
        const subcat = await prisma.category.upsert({
          where: {
            domainId_departmentId_parentId_slug: {
              domainId: domain.id,
              departmentId: dept ? dept.id : null as any,
              parentId: category.id,
              slug: sub.slug,
            },
          },
          update: {
            name: sub.name,
            level: 2,
          },
          create: {
            domainId: domain.id,
            departmentId: dept ? dept.id : null,
            parentId: category.id,
            name: sub.name,
            slug: sub.slug,
            level: 2,
            sortOrder: ++subcatCount,
            status: 0,
          },
        });

        // Map subcategory to its specific size group
        const targetSizeGroupCode = sub.sizeGroupCode || catDef.sizeGroupCode;
        if (targetSizeGroupCode && sizeGroupMap.has(targetSizeGroupCode)) {
          const sg = sizeGroupMap.get(targetSizeGroupCode);
          await prisma.categorySize.upsert({
            where: {
              categoryId_sizeGroupId_sizeId: {
                categoryId: subcat.id,
                sizeGroupId: sg.id,
                sizeId: null as any,
              },
            },
            update: {},
            create: {
              categoryId: subcat.id,
              sizeGroupId: sg.id,
              isDefault: true,
              status: 0,
            },
          });
          mappingCount++;
        }
      }
    }
  }

  console.log(`\nTaxonomy seeding summary:`);
  console.log(`- Domains: ${domainMap.size}`);
  console.log(`- Departments: ${deptMap.size}`);
  console.log(`- Categories (Level 1): ${catCount}`);
  console.log(`- Subcategories (Level 2): ${subcatCount}`);
  console.log(`- Size Groups: ${sizeGroupMap.size}`);
  console.log(`- Total Sizes: ${sizeMap.size}`);
  console.log(`- Category-to-Size Mappings: ${mappingCount}`);
  console.log('--- Finished Taxonomy & Sizes Import ---');
}

if (require.main === module) {
  seedTaxonomyAndSizes()
    .catch((err) => {
      console.error('Error during taxonomy seed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

