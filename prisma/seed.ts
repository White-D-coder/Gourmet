import 'dotenv/config';
import { PrismaClient, Role, OrderStatus, InquiryStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

async function main() {
  console.log('DATABASE_URL from process.env:', process.env.DATABASE_URL);
  console.log('Clearing existing database records...');
  
  // Delete in reverse order of dependencies
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.inventoryRecord.deleteMany({});
  await prisma.customizationOption.deleteMany({});
  await prisma.customizationSchema.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleared.');

  // 1. Seed Users
  console.log('Creating users...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@gormetco.com',
      firstName: 'Alastair',
      lastName: 'Gormet',
      role: Role.ADMIN,
      phone: '+18005550199',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'guest@gormetco.com',
      firstName: 'Jane',
      lastName: 'Devereaux',
      role: Role.CUSTOMER,
      phone: '+15550144',
    },
  });

  console.log(`Users created: Admin (${admin.email}), Customer (${customer.email})`);

  // 2. Load and parse products_seed.json
  const jsonPath = path.join(__dirname, 'products_seed.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Products seed JSON file not found at: ${jsonPath}`);
  }
  
  interface SeedProduct {
    sku: string;
    name: string;
    category: string;
    cost: number;
    price: number;
    best_for: string;
    notes: string;
  }

  const rawSeedProducts: SeedProduct[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${rawSeedProducts.length} products from ${jsonPath}`);

  // Extract unique category names
  const uniqueCategoryNames = Array.from(new Set(rawSeedProducts.map(p => p.category)));
  console.log('Unique categories to create:', uniqueCategoryNames);

  // 3. Create Categories
  const categoryMap: Record<string, any> = {};
  for (const catName of uniqueCategoryNames) {
    const slug = slugify(catName);
    const cat = await prisma.category.create({
      data: {
        name: catName,
        slug,
        description: `Artisanal selections of ${catName}.`,
      }
    });
    categoryMap[catName] = cat;
  }

  // Also create a "Hampers" category specifically for pre-curated hampers
  const hampersCategory = await prisma.category.create({
    data: {
      name: 'Hampers',
      slug: 'hampers',
      description: 'Pre-curated and fully customizable luxury gift hampers.',
    }
  });

  // 4. Create Collections
  console.log('Creating collections...');
  const signature = await prisma.collection.create({
    data: { name: 'Signature Series', slug: 'signature', description: 'The absolute finest of GormetCo, curated for ultimate elegance.', theme: 'Gold & Obsidian' },
  });
  const wedding = await prisma.collection.create({
    data: { name: 'Wedding Favors', slug: 'wedding', description: 'Exquisite favors and personalized keepsakes for your special day.', theme: 'Ivory & Satin' },
  });
  const corporateCol = await prisma.collection.create({
    data: { name: 'Corporate Prestige', slug: 'corporate', description: 'Make a lasting impression with refined corporate gifting experiences.', theme: 'Royal Navy & Walnut' },
  });

  // 5. Seed Standalone Products from Spreadsheet
  console.log('Creating products from Excel master list...');
  const dbProductsMap: Record<string, any> = {};

  for (const sp of rawSeedProducts) {
    const parentCategory = categoryMap[sp.category];
    const slug = slugify(sp.name);

    // Ensure we don't have slug collision
    const existing = await prisma.product.findUnique({ where: { slug } });
    const resolvedSlug = existing ? `${slug}-${sp.sku.toLowerCase()}` : slug;

    const prod = await prisma.product.create({
      data: {
        name: sp.name,
        slug: resolvedSlug,
        sku: sp.sku,
        basePrice: sp.price,
        shortDescription: sp.best_for || null,
        longDescription: sp.notes || null,
        isFeatured: sp.sku.endsWith('001') || sp.sku.endsWith('002'), // Feature first couple items of each section
        categoryId: parentCategory ? parentCategory.id : null,
        variants: {
          create: [
            { name: 'Standard Edition', sku: `${sp.sku}-STD`, priceAdjust: 0.00, inventory: 150 }
          ]
        }
      }
    });

    dbProductsMap[sp.sku] = prod;

    // Seed inventory record
    await prisma.inventoryRecord.create({
      data: {
        productId: prod.id,
        quantity: 100,
        type: 'ADD',
        notes: `Initial stock seeding of product SKU ${prod.sku}`,
      }
    });
  }

  console.log(`Seeded ${Object.keys(dbProductsMap).length} catalog products.`);

  // 6. Re-seed Hampers and Configurable Options (Required for site pages & flows)
  console.log('Seeding pre-curated hampers...');

  // --- Hamper Product 1: The Botanical Heritage ---
  const botanicalHamper = await prisma.product.create({
    data: {
      name: 'The Botanical Heritage',
      slug: 'the-botanical-heritage',
      sku: 'HAMPER-BOTANICAL-001',
      basePrice: 120.00,
      shortDescription: 'A garden-inspired luxury collection featuring fine teas, botanical treats, and a hand-poured soy candle.',
      longDescription: 'Designed to invoke tranquility, The Botanical Heritage hamper includes a selection of loose-leaf herbal teas, gourmet honey jars, organic shortbreads, and a sandalwood candle. Perfect for congratulations, housewarmings, or wellness gestures.',
      isFeatured: true,
      categoryId: hampersCategory.id,
      collectionId: signature.id,
      variants: {
        create: [
          { name: 'Curated Edition', sku: 'HAMPER-BOTANICAL-001-STD', priceAdjust: 0.00, inventory: 40 }
        ]
      }
    }
  });

  // Add Customizations for The Botanical Heritage
  const botRibbonSchema = await prisma.customizationSchema.create({
    data: {
      productId: botanicalHamper.id,
      name: 'Satin Ribbon Selection',
      type: 'PACKAGING_CHOICE',
      isRequired: true,
    }
  });
  await prisma.customizationOption.createMany({
    data: [
      { schemaId: botRibbonSchema.id, label: 'Sage Green Satin Ribbon', priceAdjust: 0.00 },
      { schemaId: botRibbonSchema.id, label: 'Gold Metallic Ribbon', priceAdjust: 5.00 },
      { schemaId: botRibbonSchema.id, label: 'Burgundy Velvet Ribbon', priceAdjust: 8.00 }
    ]
  });

  const botEngraveSchema = await prisma.customizationSchema.create({
    data: {
      productId: botanicalHamper.id,
      name: 'Engraved Message Box Plaque',
      type: 'TEXT_ENGRAVING',
      isRequired: false,
    }
  });
  await prisma.customizationOption.createMany({
    data: [
      { schemaId: botEngraveSchema.id, label: 'Personalized Brass Plate (Max 30 chars)', priceAdjust: 15.00 },
      { schemaId: botEngraveSchema.id, label: 'No Engraving Needed', priceAdjust: 0.00 }
    ]
  });

  const botAddonSchema = await prisma.customizationSchema.create({
    data: {
      productId: botanicalHamper.id,
      name: 'Upgrade Outer Box Packaging',
      type: 'ADDON',
      isRequired: false,
    }
  });
  await prisma.customizationOption.createMany({
    data: [
      { schemaId: botAddonSchema.id, label: 'Premium Mahogany Wood Box', priceAdjust: 20.00 },
      { schemaId: botAddonSchema.id, label: 'Signature Gold Cardboard Box', priceAdjust: 0.00 }
    ]
  });

  // --- Hamper Product 2: The Ivory Keepsake ---
  const ivoryHamper = await prisma.product.create({
    data: {
      name: 'The Ivory Keepsake',
      slug: 'the-ivory-keepsake',
      sku: 'HAMPER-IVORY-002',
      basePrice: 180.00,
      shortDescription: 'An ultra-premium wedding and anniversary curation of delicate keepsakes and gourmet treats.',
      longDescription: 'Express your deepest sentiments with a timeless celebration. The Ivory Keepsake features our Silver Plated Tea Infuser, a set of fine bone china cups, organic honey lavender biscuits, and gourmet truffles, all encased in a beautiful fabric-wrapped presentation box.',
      isFeatured: true,
      categoryId: hampersCategory.id,
      collectionId: wedding.id,
      variants: {
        create: [
          { name: 'Curated Edition', sku: 'HAMPER-IVORY-002-STD', priceAdjust: 0.00, inventory: 25 }
        ]
      }
    }
  });

  const ivoryRibbonSchema = await prisma.customizationSchema.create({
    data: {
      productId: ivoryHamper.id,
      name: 'Satin Ribbon Selection',
      type: 'PACKAGING_CHOICE',
      isRequired: true,
    }
  });
  await prisma.customizationOption.createMany({
    data: [
      { schemaId: ivoryRibbonSchema.id, label: 'Ivory Satin Ribbon', priceAdjust: 0.00 },
      { schemaId: ivoryRibbonSchema.id, label: 'Champagne Gold Silk Ribbon', priceAdjust: 5.00 }
    ]
  });

  const ivoryCardSchema = await prisma.customizationSchema.create({
    data: {
      productId: ivoryHamper.id,
      name: 'Handwritten Calligraphy Card',
      type: 'TEXT_ENGRAVING',
      isRequired: false,
    }
  });
  await prisma.customizationOption.createMany({
    data: [
      { schemaId: ivoryCardSchema.id, label: 'Hand-written Calligraphy (Max 100 chars)', priceAdjust: 10.00 },
      { schemaId: ivoryCardSchema.id, label: 'Standard Printed Greeting', priceAdjust: 3.00 },
      { schemaId: ivoryCardSchema.id, label: 'No Greeting Card', priceAdjust: 0.00 }
    ]
  });

  // --- Hamper Product 3: The Imperial Executive ---
  const imperialHamper = await prisma.product.create({
    data: {
      name: 'The Imperial Executive',
      slug: 'the-imperial-executive',
      sku: 'HAMPER-IMPERIAL-003',
      basePrice: 250.00,
      shortDescription: 'The pinnacle of corporate gifting, featuring custom coffee, chocolates, and premium office keepsakes.',
      longDescription: 'Commemorate board milestones and VIP relations. The Imperial Executive contains our Single Origin Coffee, Dark Chocolate Truffles, a leather-bound notebook, a solid brass pen, and a polished desk tray. Elegant and highly customizable.',
      isFeatured: true,
      isCorporate: true,
      categoryId: hampersCategory.id,
      collectionId: corporateCol.id,
      variants: {
        create: [
          { name: 'Executive Edition', sku: 'HAMPER-IMPERIAL-003-EXE', priceAdjust: 0.00, inventory: 15 },
          { name: 'Presidential Edition (w/ Sterling Pen)', sku: 'HAMPER-IMPERIAL-003-PRE', priceAdjust: 80.00, inventory: 8 }
        ]
      }
    }
  });

  const impCorpBranding = await prisma.customizationSchema.create({
    data: {
      productId: imperialHamper.id,
      name: 'Corporate Branding Choices',
      type: 'PACKAGING_CHOICE',
      isRequired: true,
    }
  });
  await prisma.customizationOption.createMany({
    data: [
      { schemaId: impCorpBranding.id, label: 'Laser-Engraved Logo on Box Plaque', priceAdjust: 20.00, isCorporate: true },
      { schemaId: impCorpBranding.id, label: 'Custom Branded Ribbon (Gold Foil)', priceAdjust: 15.00, isCorporate: true },
      { schemaId: impCorpBranding.id, label: 'Standard Ribbon & Gift Tags (No Corporate Logo)', priceAdjust: 0.00, isCorporate: false }
    ]
  });

  const impWoodSchema = await prisma.customizationSchema.create({
    data: {
      productId: imperialHamper.id,
      name: 'Premium Packaging Base',
      type: 'ADDON',
      isRequired: false,
    }
  });
  await prisma.customizationOption.createMany({
    data: [
      { schemaId: impWoodSchema.id, label: 'Walnut Wood Chest with Brass Hasp', priceAdjust: 40.00, isCorporate: true },
      { schemaId: impWoodSchema.id, label: 'Premium Black Matte Cardboard Box', priceAdjust: 0.00 }
    ]
  });

  // --- Bespoke Gift Box Product ---
  const bespokeBox = await prisma.product.create({
    data: {
      name: 'Bespoke Gift Box',
      slug: 'bespoke-gift-box',
      sku: 'BESPOKE-BOX-001',
      basePrice: 45.00,
      shortDescription: 'Configure your luxury keepsake box for rare occasions.',
      longDescription: 'Design every aspect of GormetCo\'s iconic keepsake gift boxes. Choose the base box construction, satin ribbons, custom cushion interior, and personalization plaques. Ideal for wedding favors, private gala keepsakes, and customized milestones.',
      isFeatured: false,
      categoryId: categoryMap['Crafted In-House']?.id || hampersCategory.id,
      variants: {
        create: [
          { name: 'Standard Keepsake Box', sku: 'BESPOKE-BOX-001-STD', priceAdjust: 0.00, inventory: 500 }
        ]
      }
    }
  });

  const bespokeBoxSchema = await prisma.customizationSchema.create({
    data: {
      productId: bespokeBox.id,
      name: 'Packaging Base Box',
      type: 'PACKAGING_CHOICE',
      isRequired: true,
    }
  });
  await prisma.customizationOption.createMany({
    data: [
      { schemaId: bespokeBoxSchema.id, label: 'Classic Ivory Silk Box', priceAdjust: 0.00 },
      { schemaId: bespokeBoxSchema.id, label: 'Royal Mahogany Chest', priceAdjust: 20.00 },
      { schemaId: bespokeBoxSchema.id, label: 'Black Velvet Cylinder', priceAdjust: 10.00 }
    ]
  });

  const bespokeRibbonSchema = await prisma.customizationSchema.create({
    data: {
      productId: bespokeBox.id,
      name: 'Satin Ribbon Selection',
      type: 'PACKAGING_CHOICE',
      isRequired: true,
    }
  });
  await prisma.customizationOption.createMany({
    data: [
      { schemaId: bespokeRibbonSchema.id, label: 'Ivory Satin Ribbon', priceAdjust: 0.00 },
      { schemaId: bespokeRibbonSchema.id, label: 'Gold Metallic Ribbon', priceAdjust: 5.00 },
      { schemaId: bespokeRibbonSchema.id, label: 'Emerald Velvet Ribbon', priceAdjust: 8.00 }
    ]
  });

  const bespokeEngraveSchema = await prisma.customizationSchema.create({
    data: {
      productId: bespokeBox.id,
      name: 'Engraved Message Box Plaque',
      type: 'TEXT_ENGRAVING',
      isRequired: false,
    }
  });
  await prisma.customizationOption.createMany({
    data: [
      { schemaId: bespokeEngraveSchema.id, label: 'Personalized Brass Plate', priceAdjust: 15.00 },
      { schemaId: bespokeEngraveSchema.id, label: 'No Engraving Needed', priceAdjust: 0.00 }
    ]
  });

  // Seed inventory records for hampers and bespoke box
  const additionalProducts = [botanicalHamper, ivoryHamper, imperialHamper, bespokeBox];
  for (const prod of additionalProducts) {
    await prisma.inventoryRecord.create({
      data: {
        productId: prod.id,
        quantity: 100,
        type: 'ADD',
        notes: `Initial stock seeding of product SKU ${prod.sku}`,
      }
    });
  }

  // 7. Seed Inquiries
  console.log('Creating demo corporate and bespoke inquiries...');
  await prisma.inquiry.createMany({
    data: [
      {
        companyName: 'Luxe Hospitality Group',
        contactName: 'Victoria Sterling',
        email: 'v.sterling@luxehospitality.com',
        phone: '+13125550212',
        budget: '20000',
        quantityRange: '100-250',
        occasion: 'Holiday Gifting',
        requirements: 'We want 150 Botanical Heritage hampers with green velvet ribbons and custom brass plaques displaying our hotel emblem.',
        status: InquiryStatus.NEW,
        adminNotes: 'Awaiting logo vector file from client.',
      },
      {
        companyName: 'Apex Advisory Services',
        contactName: 'Jonathan Vane',
        email: 'jvane@apexadvisory.com',
        phone: '+14155550187',
        budget: '7500',
        quantityRange: '25-50',
        occasion: 'Annual VIP Retainer appreciation',
        requirements: 'Need 30 Imperial Executive hampers in Walnut Wood chests. Requesting standard shipping to single corporate office.',
        status: InquiryStatus.CONTACTED,
        adminNotes: 'Discussed pricing and walnut chest upgrade. Client liked the mock.',
      },
      {
        companyName: 'Private Event (Wedding)',
        contactName: 'Elise & Pierre',
        email: 'elise.pierre@wedding2026.com',
        phone: '+12125550991',
        budget: '3500',
        quantityRange: '50-100',
        occasion: 'Wedding Favors',
        requirements: 'Interested in bespoke favor boxes with custom handwritten calligraphy cards for 80 guests.',
        status: InquiryStatus.PROPOSAL_SENT,
        adminNotes: 'Sent quote for $38 per customized favor on May 24th.',
      }
    ]
  });

  // 8. Seed Demo Order
  console.log('Creating demo orders for dashboard activity statistics...');
  const standaloneChoco = dbProductsMap['GRM-004'] || dbProductsMap[Object.keys(dbProductsMap)[0]];

  const order1 = await prisma.order.create({
    data: {
      userId: customer.id,
      status: OrderStatus.PAID,
      totalAmount: 320.00,
      taxAmount: 24.00,
      deliveryFee: 15.00,
      customerDetails: JSON.stringify({
        email: 'guest@gormetco.com',
        firstName: 'Jane',
        lastName: 'Devereaux',
        phone: '+15550144'
      }),
      deliveryDetails: JSON.stringify({
        addressLine1: '848 Fifth Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10065',
        country: 'USA'
      }),
      items: {
        create: [
          {
            productId: botanicalHamper.id,
            quantity: 2,
            priceSnapshot: 120.00,
            customizationState: JSON.stringify({
              'Satin Ribbon Selection': 'Sage Green Satin Ribbon',
              'Upgrade Outer Box Packaging': 'Premium Mahogany Wood Box'
            })
          },
          {
            productId: standaloneChoco ? standaloneChoco.id : botanicalHamper.id,
            quantity: 1,
            priceSnapshot: standaloneChoco ? standaloneChoco.basePrice : 25.00,
            customizationState: JSON.stringify({})
          }
        ]
      }
    }
  });

  console.log(`Demo orders created. Order ID: ${order1.id}`);
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
