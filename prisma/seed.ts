import 'dotenv/config';
import { PrismaClient, Role, OrderStatus, InquiryStatus } from '@prisma/client';

const prisma = new PrismaClient();

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

  // 2. Seed Categories
  console.log('Creating categories...');
  const gourmet = await prisma.category.create({
    data: { name: 'Gourmet', slug: 'gourmet', description: 'Artisanal chocolates, luxury truffles, and delicate sweets.' },
  });
  const beverage = await prisma.category.create({
    data: { name: 'Beverage', slug: 'beverage', description: 'Single-origin coffee beans, loose leaf teas, and grand crus.' },
  });
  const keepsake = await prisma.category.create({
    data: { name: 'Keepsake', slug: 'keepsake', description: 'Silver-plated tableware, crystal coasters, and legacy heirlooms.' },
  });
  const decor = await prisma.category.create({
    data: { name: 'Decor', slug: 'decor', description: 'Hand-poured luxury soy candles and elegant table decorations.' },
  });
  const hampers = await prisma.category.create({
    data: { name: 'Hampers', slug: 'hampers', description: 'Pre-curated and fully customizable luxury gift hampers.' },
  });

  // 3. Seed Collections
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

  // 4. Seed Products
  console.log('Creating products, variants, and customizations...');

  // --- Standalone Product 1: Gourmet Truffles ---
  const truffles = await prisma.product.create({
    data: {
      name: 'Premium Dark Chocolate Truffles',
      slug: 'premium-dark-chocolate-truffles',
      sku: 'STAND-CHOCO-001',
      basePrice: 25.00,
      shortDescription: 'Velvety Ganache infused with French sea salt, covered in 70% dark chocolate.',
      longDescription: 'Crafted by master chocolatiers, our Signature Dark Chocolate Truffles are made with responsibly sourced single-origin cacao. Each box contains twelve truffles hand-dusted with edible gold dust and cocoa powder, offering an unforgettable melting experience.',
      isFeatured: true,
      categoryId: gourmet.id,
      collectionId: signature.id,
      variants: {
        create: [
          { name: 'Standard (12 Pcs)', sku: 'STAND-CHOCO-001-STD', priceAdjust: 0.00, inventory: 150 },
          { name: 'Grand (24 Pcs)', sku: 'STAND-CHOCO-001-GRD', priceAdjust: 20.00, inventory: 80 }
        ]
      }
    }
  });

  // --- Standalone Product 2: Single Origin Coffee ---
  const coffee = await prisma.product.create({
    data: {
      name: 'Single Origin Coffee Beans',
      slug: 'single-origin-coffee-beans',
      sku: 'STAND-COFFEE-002',
      basePrice: 18.00,
      shortDescription: 'Ethiopian Yirgacheffe medium roast with floral notes and bergamot acidity.',
      longDescription: 'Sourced from the high-altitude Gedeo zone in Ethiopia, this micro-lot coffee is wet-processed and sun-dried on raised beds. The medium roast accentuates its complex cup profile featuring bright citrus, sweet honey, and jasmine floral notes.',
      categoryId: beverage.id,
      variants: {
        create: [
          { name: '250g Whole Bean', sku: 'STAND-COFFEE-002-WB250', priceAdjust: 0.00, inventory: 100 },
          { name: '250g Fine Ground', sku: 'STAND-COFFEE-002-FG250', priceAdjust: 0.00, inventory: 100 }
        ]
      }
    }
  });

  // --- Standalone Product 3: Tea Infuser ---
  const infuser = await prisma.product.create({
    data: {
      name: 'Silver Plated Tea Infuser',
      slug: 'silver-plated-tea-infuser',
      sku: 'STAND-TEA-003',
      basePrice: 30.00,
      shortDescription: 'Intricately designed sterling silver-plated tea strainer.',
      longDescription: 'Add a touch of Victorian splendor to your high tea. This fine mesh tea infuser is handcrafted with a silver-plated handle, designed to sit perfectly atop standard teacups while releasing the full aroma of loose tea leaves.',
      categoryId: keepsake.id,
      variants: {
        create: [
          { name: 'Sterling Silver Strainer', sku: 'STAND-TEA-003-STD', priceAdjust: 0.00, inventory: 75 }
        ]
      }
    }
  });

  // --- Standalone Product 4: Soy Candle ---
  const candle = await prisma.product.create({
    data: {
      name: 'Hand-poured Soy Candle',
      slug: 'hand-poured-soy-candle',
      sku: 'STAND-CANDLE-004',
      basePrice: 22.00,
      shortDescription: 'Scented with sandalwood, dry amber, and dark plum in a matte glass jar.',
      longDescription: 'Bring serenity to any space with our hand-poured soy wax candle. Formulated with a clean-burning cotton wick, it features base notes of deep sandalwood and musk, topped by amber warmth and sweet dark plum. Burns cleanly for 50 hours.',
      categoryId: decor.id,
      variants: {
        create: [
          { name: 'Amber Sandalwood (8oz)', sku: 'STAND-CANDLE-004-AMB', priceAdjust: 0.00, inventory: 200 },
          { name: 'Smoky Fig (8oz)', sku: 'STAND-CANDLE-004-FIG', priceAdjust: 0.00, inventory: 150 }
        ]
      }
    }
  });

  // --- Standalone Product 5: Roasted Makhana ---
  const makhana = await prisma.product.create({
    data: {
      name: 'Artisanal Roasted Makhana',
      slug: 'artisanal-roasted-makhana',
      sku: 'STAND-MAKHANA-005',
      basePrice: 25.00,
      shortDescription: 'Hand-roasted lotus seeds tossed in gourmet herbs and clarified butter.',
      longDescription: 'Light, crunchy, and packed with flavor, our gourmet roasted makhana is tossed in premium organic herbs and organic clarified butter.',
      categoryId: gourmet.id,
      variants: {
        create: [
          { name: 'Herb & Pepper (150g)', sku: 'STAND-MAKHANA-005-STD', priceAdjust: 0.00, inventory: 100 }
        ]
      }
    }
  });

  // --- Standalone Product 6: Dryfruits Mix ---
  const dryfruits = await prisma.product.create({
    data: {
      name: 'Premium Dryfruits Mix',
      slug: 'premium-dryfruits-mix',
      sku: 'STAND-DRYFRUITS-006',
      basePrice: 45.00,
      shortDescription: 'A luxury selection of organic raw almonds, cashews, and jumbo pistachios.',
      longDescription: 'Handpicked organic nuts of the absolute highest grade, slow-roasted to perfection without added oils.',
      categoryId: gourmet.id,
      variants: {
        create: [
          { name: 'Signature Blend (300g)', sku: 'STAND-DRYFRUITS-006-STD', priceAdjust: 0.00, inventory: 120 }
        ]
      }
    }
  });

  // --- Standalone Product 7: Blush Leather Diary ---
  const diary = await prisma.product.create({
    data: {
      name: 'Blush Leather Diary',
      slug: 'blush-leather-diary',
      sku: 'STAND-DIARY-007',
      basePrice: 65.00,
      shortDescription: 'Hand-stitched top-grain Italian leather journal with custom hot-gold lettering.',
      longDescription: 'Crafted with acid-free unlined paper and encased in premium, vegetable-tanned blush pink leather that ages beautifully.',
      categoryId: keepsake.id,
      variants: {
        create: [
          { name: 'Standard Edition', sku: 'STAND-DIARY-007-STD', priceAdjust: 0.00, inventory: 80 }
        ]
      }
    }
  });

  // --- Standalone Product 8: Rose Quartz Crystal Tree ---
  const crystalTree = await prisma.product.create({
    data: {
      name: 'Rose Quartz Crystal Tree',
      slug: 'rose-quartz-crystal-tree',
      sku: 'STAND-CRYSTAL-008',
      basePrice: 95.00,
      shortDescription: 'An elegant rose quartz crystal tree adorned with delicate brass wire and real 24k gold leaf accents.',
      longDescription: 'Handmade rose quartz tree anchored on a real raw crystal cluster base, designed to channel warm, positive vibes.',
      categoryId: decor.id,
      variants: {
        create: [
          { name: 'Classic Rose Quartz', sku: 'STAND-CRYSTAL-008-STD', priceAdjust: 0.00, inventory: 50 }
        ]
      }
    }
  });

  // --- Standalone Product 9: Earl Grey Royal Tea Blend ---
  const earlGrey = await prisma.product.create({
    data: {
      name: 'Earl Grey Royal Tea Blend',
      slug: 'earl-grey-royal-tea-blend',
      sku: 'STAND-TEA-009',
      basePrice: 35.00,
      shortDescription: 'A robust black tea base infused with pure cold-pressed oil of Bergamot.',
      longDescription: 'Sourced from the best estates in Assam and Nilgiri, blended with organic blue cornflower petals for a beautiful visual finish and floral nose.',
      categoryId: beverage.id,
      variants: {
        create: [
          { name: 'Tin Canister (100g)', sku: 'STAND-TEA-009-STD', priceAdjust: 0.00, inventory: 150 }
        ]
      }
    }
  });

  // --- Standalone Product 10: Organic Honey Lavender Jars ---
  const honeyLavender = await prisma.product.create({
    data: {
      name: 'Organic Honey Lavender Jars',
      slug: 'organic-honey-lavender-jars',
      sku: 'STAND-HONEY-010',
      basePrice: 20.00,
      shortDescription: 'Small glass jar of organic honey infused with lavender buds.',
      longDescription: 'Harvested from wild mountain hives, infused with certified organic dried lavender buds for a floral and soothing finish.',
      categoryId: gourmet.id,
      variants: {
        create: [
          { name: 'Glass Jar (150g)', sku: 'STAND-HONEY-010-STD', priceAdjust: 0.00, inventory: 90 }
        ]
      }
    }
  });

  // --- Standalone Product 11: Gold Foil Playing Cards ---
  const playingCards = await prisma.product.create({
    data: {
      name: 'Gold Foil Playing Cards',
      slug: 'gold-foil-playing-cards',
      sku: 'STAND-CARDS-011',
      basePrice: 40.00,
      shortDescription: 'Premium deck of playing cards with intricate gold foil back designs.',
      longDescription: 'Waterproof, durable, and completely covered in beautiful textured gold foil reflecting ambient light with gold metallic box packaging.',
      categoryId: keepsake.id,
      variants: {
        create: [
          { name: 'Royal Edition', sku: 'STAND-CARDS-011-STD', priceAdjust: 0.00, inventory: 110 }
        ]
      }
    }
  });

  // --- Standalone Product 12: Sandalwood Incense Cones ---
  const incenseCones = await prisma.product.create({
    data: {
      name: 'Sandalwood Incense Cones',
      slug: 'sandalwood-incense-cones',
      sku: 'STAND-INCENSE-012',
      basePrice: 15.00,
      shortDescription: 'Ceramic burner with sandalwood incense cones emitting a thin calming spiral of smoke.',
      longDescription: 'Natural sandalwood paste hand-formed into incense cones, burning cleanly to clear negativity and calm the soul.',
      categoryId: decor.id,
      variants: {
        create: [
          { name: 'Standard Pack (30 Cones)', sku: 'STAND-INCENSE-012-STD', priceAdjust: 0.00, inventory: 130 }
        ]
      }
    }
  });

  // --- Standalone Product 13: Fine Bone China Cup ---
  const chinaCup = await prisma.product.create({
    data: {
      name: 'Fine Bone China Cup',
      slug: 'fine-bone-china-cup',
      sku: 'STAND-CUP-013',
      basePrice: 55.00,
      shortDescription: 'Elegant fine bone china tea cup with gold leaf handles and trim.',
      longDescription: 'High-translucency fine bone china with hand-painted 24k gold filigree border trims and comfortable ornate handle.',
      categoryId: keepsake.id,
      variants: {
        create: [
          { name: 'Standard Saucer Cup Set', sku: 'STAND-CUP-013-STD', priceAdjust: 0.00, inventory: 60 }
        ]
      }
    }
  });

  // --- Standalone Product 14: Belgian Waffle Crisps ---
  const waffleCrisps = await prisma.product.create({
    data: {
      name: 'Belgian Waffle Crisps',
      slug: 'belgian-waffle-crisps',
      sku: 'STAND-WAFFLE-014',
      basePrice: 18.00,
      shortDescription: 'Luxury package of thin Belgian waffle crisps made with fresh butter.',
      longDescription: 'Crisp, golden-baked waffle cookies made with real cream butter and caramelized brown sugar from a legacy Belgian recipe.',
      categoryId: gourmet.id,
      variants: {
        create: [
          { name: 'Gift Box (150g)', sku: 'STAND-WAFFLE-014-STD', priceAdjust: 0.00, inventory: 140 }
        ]
      }
    }
  });

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
      categoryId: hampers.id,
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
      categoryId: hampers.id,
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
      categoryId: hampers.id,
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
      categoryId: keepsake.id,
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


  // 5. Seed Inventory Records
  console.log('Writing initial inventory log records...');
  const allProducts = [
    truffles, coffee, infuser, candle,
    makhana, dryfruits, diary, crystalTree,
    earlGrey, honeyLavender, playingCards, incenseCones,
    chinaCup, waffleCrisps,
    botanicalHamper, ivoryHamper, imperialHamper, bespokeBox
  ];
  for (const prod of allProducts) {
    await prisma.inventoryRecord.create({
      data: {
        productId: prod.id,
        quantity: 100,
        type: 'ADD',
        notes: `Initial stock seeding of product SKU ${prod.sku}`,
      }
    });
  }

  // 6. Seed some initial Inquiries for the admin dashboard pipeline
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

  // 7. Seed some demo Orders
  console.log('Creating demo orders for dashboard activity statistics...');
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
            productId: truffles.id,
            quantity: 1,
            priceSnapshot: 25.00,
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
