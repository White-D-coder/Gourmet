import 'dotenv/config';
import { PricingService } from '../pricing.service';
import { CustomizationService } from '../customization.service';
import { InventoryService } from '../inventory.service';
import { prisma } from '../db';
import assert from 'assert';

async function runTests() {
  console.log('--- Starting Integration Test Suite ---');

  try {
    // 1. Fetch Truffles Product for testing
    const truffles = await prisma.product.findUnique({
      where: { slug: 'premium-dark-chocolate-truffles' },
      include: { variants: true, customizations: { include: { options: true } } },
    });

    if (!truffles) {
      throw new Error('Test product Premium Dark Chocolate Truffles not found. Run seeding first.');
    }
    console.log('✔ Found test product:', truffles.name);

    // 2. Validate Pricing Service Calculations
    console.log('Testing PricingService...');
    const quantity = 3;
    const stdVariant = truffles.variants.find(v => v.name.includes('Standard'));
    
    if (!stdVariant) {
      throw new Error('Standard variant not found for truffles.');
    }

    const priceBreakdown = await PricingService.calculatePrice({
      productId: truffles.id,
      variantId: stdVariant.id,
      customizationOptions: [],
      quantity,
    });

    const expectedBase = Number(truffles.basePrice);
    const expectedSubtotal = expectedBase * quantity;
    const expectedTax = expectedSubtotal * 0.1;
    const expectedTotal = expectedSubtotal + expectedTax + 15.00; // 15 flat shipping

    assert.strictEqual(priceBreakdown.basePrice, expectedBase, 'Base price mismatch');
    assert.strictEqual(priceBreakdown.subtotal, expectedSubtotal, 'Subtotal mismatch');
    assert.strictEqual(priceBreakdown.tax, expectedTax, 'Tax mismatch');
    assert.strictEqual(priceBreakdown.total, expectedTotal, 'Total price mismatch');
    console.log('✔ PricingService assertions passed!');

    // 3. Validate Customization Service Logic
    console.log('Testing CustomizationService...');
    // Seeding should have created customizations for The Botanical Heritage
    const botanical = await prisma.product.findUnique({
      where: { slug: 'the-botanical-heritage' },
      include: { customizations: { include: { options: true } } },
    });

    if (botanical) {
      // Find a required schema (e.g. Satin Ribbon Selection)
      const requiredSchema = botanical.customizations.find(c => c.isRequired);
      
      if (requiredSchema) {
        console.log(`Checking required schema: "${requiredSchema.name}"`);
        
        // Assert: Running validation with no options should THROW an error since it is required
        try {
          await CustomizationService.validateCustomizations(botanical.id, []);
          assert.fail('CustomizationService should have thrown for missing required options');
        } catch (e: unknown) {
          assert.ok((e as Error).message.includes('is required'), 'Error message should complain about required field');
          console.log('✔ Correctly threw validation error for missing required choice.');
        }

        // Assert: Running validation with a valid option from the schema should succeed
        const validOption = requiredSchema.options[0];
        const validationResult = await CustomizationService.validateCustomizations(botanical.id, [validOption.id]);
        assert.strictEqual(validationResult, true, 'Validation should pass with correct required options');
        console.log('✔ Successfully validated with correct options.');
      }
    } else {
      console.log('⚠ Skipping CustomizationService test because "the-botanical-heritage" was not found.');
    }

    // 4. Validate Inventory Service Stock Deductions
    console.log('Testing InventoryService...');
    const originalInventory = stdVariant.inventory;
    console.log(`Current standard variant stock: ${originalInventory}`);

    // Reserve 2 units
    const reserveQty = 2;
    await InventoryService.reserveInventory(truffles.id, stdVariant.id, reserveQty);

    // Refetch stock levels
    const updatedVariant = await prisma.productVariant.findUnique({
      where: { id: stdVariant.id },
    });

    if (!updatedVariant) {
      throw new Error('Could not refetch variant.');
    }

    console.log(`Stock level after reservation: ${updatedVariant.inventory}`);
    assert.strictEqual(updatedVariant.inventory, originalInventory - reserveQty, 'Inventory deduction quantity mismatch');
    console.log('✔ Inventory reservation assertion passed!');

    // Restore stock levels so we leave database clean
    await prisma.productVariant.update({
      where: { id: stdVariant.id },
      data: { inventory: originalInventory },
    });
    console.log('✔ Restored stock count to original level.');

    console.log('--- All Integration Tests Completed Successfully! ---');
  } catch (err) {
    console.error('✖ Integration Test Suite Failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
