-- ====================================================================
-- Ad2Ship Multi-Vendor Marketplace
-- Taxonomy & Sizes Import Data Script
-- Follows Product, Operations & Database Blueprint specification
-- ====================================================================

-- 1. DOMAINS (Fashion, Beauty, Home & Living, Electronics)
INSERT INTO domains (name, slug, code, description, sort_order, status, soft_delete, created_at, updated_at)
VALUES 
  ('Fashion', 'fashion', 'FASHION', 'Clothing, footwear, bags, and fashion accessories', 1, 0, 0, NOW(), NOW()),
  ('Beauty & Personal Care', 'beauty', 'BEAUTY', 'Skincare, makeup, haircare, fragrances, and personal grooming', 2, 0, 0, NOW(), NOW()),
  ('Home & Living', 'home-living', 'HOME_LIVING', 'Furniture, home decor, bedding, kitchen and dining', 3, 0, 0, NOW(), NOW()),
  ('Electronics', 'electronics', 'ELECTRONICS', 'Mobiles, computers, audio, appliances and wearables', 4, 0, 0, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- 2. DEPARTMENTS (Only Fashion domain uses Men, Women, Kids)
INSERT INTO departments (domain_id, name, slug, code, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, 'Men', 'fashion-men', 'MEN', 1, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'fashion'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  domain_id = EXCLUDED.domain_id,
  code = EXCLUDED.code,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO departments (domain_id, name, slug, code, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, 'Women', 'fashion-women', 'WOMEN', 2, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'fashion'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  domain_id = EXCLUDED.domain_id,
  code = EXCLUDED.code,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO departments (domain_id, name, slug, code, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, 'Kids', 'fashion-kids', 'KIDS', 3, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'fashion'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  domain_id = EXCLUDED.domain_id,
  code = EXCLUDED.code,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- 3. SIZE GROUPS
INSERT INTO size_groups (code, name, description, sort_order, status, soft_delete, created_at, updated_at)
VALUES
  ('APPAREL_STANDARD', 'Apparel (Standard / Tops)', 'Standard alpha sizes for shirts, t-shirts, dresses, jackets', 1, 0, 0, NOW(), NOW()),
  ('BOTTOMWEAR_WAIST', 'Bottomwear (Waist inches)', 'Waist circumference in inches for jeans, trousers, shorts', 2, 0, 0, NOW(), NOW()),
  ('FOOTWEAR_UK', 'Footwear (UK / India)', 'Standard footwear sizes UK 5 through UK 12', 3, 0, 0, NOW(), NOW()),
  ('KIDS_AGE', 'Kids Age Sizes', 'Infant months and growing kids age ranges', 4, 0, 0, NOW(), NOW()),
  ('FREE_SIZE', 'Free Size / Universal', 'Single size or universal fitting products', 5, 0, 0, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- 4. SIZES FOR APPAREL_STANDARD
INSERT INTO sizes (size_group_id, name, code, sort_order, status, soft_delete, created_at, updated_at)
SELECT sg.id, s.name, s.code, s.sort_order, 0, 0, NOW(), NOW()
FROM size_groups sg
CROSS JOIN (
  VALUES 
    ('XS', 'XS', 1),
    ('S', 'S', 2),
    ('M', 'M', 3),
    ('L', 'L', 4),
    ('XL', 'XL', 5),
    ('XXL', 'XXL', 6),
    ('3XL', '3XL', 7),
    ('4XL', '4XL', 8),
    ('5XL', '5XL', 9)
) AS s(name, code, sort_order)
WHERE sg.code = 'APPAREL_STANDARD'
ON CONFLICT (size_group_id, code) DO UPDATE SET 
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- 4. SIZES FOR BOTTOMWEAR_WAIST
INSERT INTO sizes (size_group_id, name, code, sort_order, status, soft_delete, created_at, updated_at)
SELECT sg.id, s.name, s.code, s.sort_order, 0, 0, NOW(), NOW()
FROM size_groups sg
CROSS JOIN (
  VALUES 
    ('28', '28', 1),
    ('30', '30', 2),
    ('32', '32', 3),
    ('34', '34', 4),
    ('36', '36', 5),
    ('38', '38', 6),
    ('40', '40', 7),
    ('42', '42', 8)
) AS s(name, code, sort_order)
WHERE sg.code = 'BOTTOMWEAR_WAIST'
ON CONFLICT (size_group_id, code) DO UPDATE SET 
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- 4. SIZES FOR FOOTWEAR_UK
INSERT INTO sizes (size_group_id, name, code, sort_order, status, soft_delete, created_at, updated_at)
SELECT sg.id, s.name, s.code, s.sort_order, 0, 0, NOW(), NOW()
FROM size_groups sg
CROSS JOIN (
  VALUES 
    ('UK 5', 'UK-5', 1),
    ('UK 6', 'UK-6', 2),
    ('UK 7', 'UK-7', 3),
    ('UK 8', 'UK-8', 4),
    ('UK 9', 'UK-9', 5),
    ('UK 10', 'UK-10', 6),
    ('UK 11', 'UK-11', 7),
    ('UK 12', 'UK-12', 8)
) AS s(name, code, sort_order)
WHERE sg.code = 'FOOTWEAR_UK'
ON CONFLICT (size_group_id, code) DO UPDATE SET 
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- 4. SIZES FOR KIDS_AGE
INSERT INTO sizes (size_group_id, name, code, sort_order, status, soft_delete, created_at, updated_at)
SELECT sg.id, s.name, s.code, s.sort_order, 0, 0, NOW(), NOW()
FROM size_groups sg
CROSS JOIN (
  VALUES 
    ('0-3M', '0-3M', 1),
    ('3-6M', '3-6M', 2),
    ('6-12M', '6-12M', 3),
    ('1-2Y', '1-2Y', 4),
    ('2-3Y', '2-3Y', 5),
    ('3-4Y', '3-4Y', 6),
    ('4-5Y', '4-5Y', 7),
    ('5-6Y', '5-6Y', 8),
    ('7-8Y', '7-8Y', 9),
    ('9-10Y', '9-10Y', 10),
    ('11-12Y', '11-12Y', 11),
    ('13-14Y', '13-14Y', 12)
) AS s(name, code, sort_order)
WHERE sg.code = 'KIDS_AGE'
ON CONFLICT (size_group_id, code) DO UPDATE SET 
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- 4. SIZES FOR FREE_SIZE
INSERT INTO sizes (size_group_id, name, code, sort_order, status, soft_delete, created_at, updated_at)
SELECT sg.id, s.name, s.code, s.sort_order, 0, 0, NOW(), NOW()
FROM size_groups sg
CROSS JOIN (
  VALUES 
    ('Free Size', 'FREE_SIZE', 1),
    ('One Size', 'ONE_SIZE', 2)
) AS s(name, code, sort_order)
WHERE sg.code = 'FREE_SIZE'
ON CONFLICT (size_group_id, code) DO UPDATE SET 
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- 5. PRIMARY CATEGORIES (LEVEL 1)
-- Men categories under Fashion
INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, dept.id, NULL, 'Men Clothing', 'men-clothing', 1, 1, 0, 0, NOW(), NOW()
FROM domains d JOIN departments dept ON dept.domain_id = d.id WHERE d.slug = 'fashion' AND dept.code = 'MEN'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, dept.id, NULL, 'Men Footwear', 'men-footwear', 1, 2, 0, 0, NOW(), NOW()
FROM domains d JOIN departments dept ON dept.domain_id = d.id WHERE d.slug = 'fashion' AND dept.code = 'MEN'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, dept.id, NULL, 'Men Accessories', 'men-accessories', 1, 3, 0, 0, NOW(), NOW()
FROM domains d JOIN departments dept ON dept.domain_id = d.id WHERE d.slug = 'fashion' AND dept.code = 'MEN'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

-- Women categories under Fashion
INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, dept.id, NULL, 'Women Clothing', 'women-clothing', 1, 4, 0, 0, NOW(), NOW()
FROM domains d JOIN departments dept ON dept.domain_id = d.id WHERE d.slug = 'fashion' AND dept.code = 'WOMEN'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, dept.id, NULL, 'Women Footwear', 'women-footwear', 1, 5, 0, 0, NOW(), NOW()
FROM domains d JOIN departments dept ON dept.domain_id = d.id WHERE d.slug = 'fashion' AND dept.code = 'WOMEN'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, dept.id, NULL, 'Women Bags & Accessories', 'women-bags-accessories', 1, 6, 0, 0, NOW(), NOW()
FROM domains d JOIN departments dept ON dept.domain_id = d.id WHERE d.slug = 'fashion' AND dept.code = 'WOMEN'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

-- Kids categories under Fashion
INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, dept.id, NULL, 'Boys Clothing', 'boys-clothing', 1, 7, 0, 0, NOW(), NOW()
FROM domains d JOIN departments dept ON dept.domain_id = d.id WHERE d.slug = 'fashion' AND dept.code = 'KIDS'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, dept.id, NULL, 'Girls Clothing', 'girls-clothing', 1, 8, 0, 0, NOW(), NOW()
FROM domains d JOIN departments dept ON dept.domain_id = d.id WHERE d.slug = 'fashion' AND dept.code = 'KIDS'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, dept.id, NULL, 'Kids Footwear', 'kids-footwear', 1, 9, 0, 0, NOW(), NOW()
FROM domains d JOIN departments dept ON dept.domain_id = d.id WHERE d.slug = 'fashion' AND dept.code = 'KIDS'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

-- Beauty categories
INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, NULL, NULL, 'Skincare', 'beauty-skincare', 1, 10, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'beauty'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, NULL, NULL, 'Makeup', 'beauty-makeup', 1, 11, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'beauty'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, NULL, NULL, 'Haircare', 'beauty-haircare', 1, 12, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'beauty'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, NULL, NULL, 'Fragrances', 'beauty-fragrances', 1, 13, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'beauty'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

-- Home & Living categories
INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, NULL, NULL, 'Bedding & Furnishings', 'home-bedding', 1, 14, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'home-living'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, NULL, NULL, 'Kitchen & Dining', 'home-kitchen', 1, 15, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'home-living'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, NULL, NULL, 'Home Decor', 'home-decor', 1, 16, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'home-living'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

-- Electronics categories
INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, NULL, NULL, 'Mobiles & Accessories', 'electronics-mobiles', 1, 17, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'electronics'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, NULL, NULL, 'Audio & Wearables', 'electronics-audio', 1, 18, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'electronics'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT d.id, NULL, NULL, 'Computer Accessories', 'electronics-computing', 1, 19, 0, 0, NOW(), NOW()
FROM domains d WHERE d.slug = 'electronics'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

-- 6. SUBCATEGORIES (LEVEL 2)
-- Men Clothing Subcategories
INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT c.domain_id, c.department_id, c.id, sub.name, sub.slug, 2, sub.sort_order, 0, 0, NOW(), NOW()
FROM categories c
CROSS JOIN (
  VALUES
    ('T-shirts', 'men-t-shirts', 1),
    ('Casual Shirts', 'men-casual-shirts', 2),
    ('Formal Shirts', 'men-formal-shirts', 3),
    ('Jeans', 'men-jeans', 4),
    ('Trousers & Chinos', 'men-trousers', 5),
    ('Jackets & Blazers', 'men-jackets', 6),
    ('Ethnic Wear & Kurtas', 'men-ethnic', 7),
    ('Innerwear & Loungewear', 'men-innerwear', 8)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'men-clothing'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

-- Men Footwear Subcategories
INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT c.domain_id, c.department_id, c.id, sub.name, sub.slug, 2, sub.sort_order, 0, 0, NOW(), NOW()
FROM categories c
CROSS JOIN (
  VALUES
    ('Sneakers & Sports Shoes', 'men-sneakers', 1),
    ('Formal Shoes', 'men-formal-shoes', 2),
    ('Casual Shoes & Loafers', 'men-casual-shoes', 3),
    ('Sandals & Floaters', 'men-sandals', 4)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'men-footwear'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

-- Women Clothing Subcategories
INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT c.domain_id, c.department_id, c.id, sub.name, sub.slug, 2, sub.sort_order, 0, 0, NOW(), NOW()
FROM categories c
CROSS JOIN (
  VALUES
    ('Kurtas & Kurti Sets', 'women-kurtas', 1),
    ('Dresses & Jumpsuits', 'women-dresses', 2),
    ('Tops, Tees & Shirts', 'women-tops', 3),
    ('Sarees', 'women-sarees', 4),
    ('Jeans & Jeggings', 'women-jeans', 5),
    ('Trousers & Palazzos', 'women-trousers', 6),
    ('Co-ord Sets', 'women-co-ords', 7)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'women-clothing'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

-- Women Footwear Subcategories
INSERT INTO categories (domain_id, department_id, parent_id, name, slug, level, sort_order, status, soft_delete, created_at, updated_at)
SELECT c.domain_id, c.department_id, c.id, sub.name, sub.slug, 2, sub.sort_order, 0, 0, NOW(), NOW()
FROM categories c
CROSS JOIN (
  VALUES
    ('Flats & Bellies', 'women-flats', 1),
    ('Heels & Wedges', 'women-heels', 2),
    ('Casual Shoes & Sneakers', 'women-sneakers', 3),
    ('Ethnic Footwear & Juttis', 'women-ethnic-shoes', 4)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'women-footwear'
ON CONFLICT (domain_id, department_id, parent_id, slug) DO NOTHING;

-- 7. CATEGORY TO SIZE GROUP MAPPINGS
-- Map Tops, Shirts, T-shirts, Dresses, Kurtas to APPAREL_STANDARD
INSERT INTO category_sizes (category_id, size_group_id, is_default, sort_order, status, created_at, updated_at)
SELECT c.id, sg.id, true, 1, 0, NOW(), NOW()
FROM categories c
CROSS JOIN size_groups sg
WHERE sg.code = 'APPAREL_STANDARD'
  AND (c.slug IN ('men-clothing', 'men-t-shirts', 'men-casual-shirts', 'men-formal-shirts', 'men-jackets', 'men-ethnic', 'men-innerwear',
                  'women-clothing', 'women-kurtas', 'women-dresses', 'women-tops', 'women-co-ords'))
ON CONFLICT (category_id, size_group_id, size_id) DO NOTHING;

-- Map Jeans, Trousers, Palazzos to BOTTOMWEAR_WAIST
INSERT INTO category_sizes (category_id, size_group_id, is_default, sort_order, status, created_at, updated_at)
SELECT c.id, sg.id, true, 1, 0, NOW(), NOW()
FROM categories c
CROSS JOIN size_groups sg
WHERE sg.code = 'BOTTOMWEAR_WAIST'
  AND (c.slug IN ('men-jeans', 'men-trousers', 'women-jeans', 'women-trousers', 'men-belts'))
ON CONFLICT (category_id, size_group_id, size_id) DO NOTHING;

-- Map Footwear to FOOTWEAR_UK
INSERT INTO category_sizes (category_id, size_group_id, is_default, sort_order, status, created_at, updated_at)
SELECT c.id, sg.id, true, 1, 0, NOW(), NOW()
FROM categories c
CROSS JOIN size_groups sg
WHERE sg.code = 'FOOTWEAR_UK'
  AND (c.slug LIKE '%footwear%' OR c.slug LIKE '%sneakers%' OR c.slug LIKE '%shoes%' OR c.slug LIKE '%sandals%' OR c.slug LIKE '%heels%' OR c.slug LIKE '%flats%')
ON CONFLICT (category_id, size_group_id, size_id) DO NOTHING;

-- Map Kids clothing to KIDS_AGE
INSERT INTO category_sizes (category_id, size_group_id, is_default, sort_order, status, created_at, updated_at)
SELECT c.id, sg.id, true, 1, 0, NOW(), NOW()
FROM categories c
CROSS JOIN size_groups sg
WHERE sg.code = 'KIDS_AGE'
  AND (c.slug IN ('boys-clothing', 'girls-clothing') OR c.department_id IN (SELECT id FROM departments WHERE code = 'KIDS'))
ON CONFLICT (category_id, size_group_id, size_id) DO NOTHING;

-- Map remaining categories (Accessories, Beauty, Home, Electronics) to FREE_SIZE
INSERT INTO category_sizes (category_id, size_group_id, is_default, sort_order, status, created_at, updated_at)
SELECT c.id, sg.id, true, 1, 0, NOW(), NOW()
FROM categories c
CROSS JOIN size_groups sg
WHERE sg.code = 'FREE_SIZE'
  AND c.domain_id IN (SELECT id FROM domains WHERE code IN ('BEAUTY', 'HOME_LIVING', 'ELECTRONICS'))
ON CONFLICT (category_id, size_group_id, size_id) DO NOTHING;

-- Verification query
SELECT 'Domains' AS entity, count(*) FROM domains
UNION ALL
SELECT 'Departments', count(*) FROM departments
UNION ALL
SELECT 'Categories (Total)', count(*) FROM categories
UNION ALL
SELECT 'Size Groups', count(*) FROM size_groups
UNION ALL
SELECT 'Sizes', count(*) FROM sizes
UNION ALL
SELECT 'Category Size Mappings', count(*) FROM category_sizes;

