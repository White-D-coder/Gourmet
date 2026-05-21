import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PricingInput {
  productId: string;
  variantId?: string;
  customizationOptions: string[]; // Array of option IDs selected
  quantity: number;
  corporateDiscountApplied?: boolean;
}

export class PricingService {
  /**
   * Calculates the exact final price breakdown for a product based on customizations.
   */
  static async calculatePrice(input: PricingInput) {
    const { productId, variantId, customizationOptions, quantity, corporateDiscountApplied } = input;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product) throw new Error('Product not found');

    let basePrice = product.basePrice.toNumber();
    
    // Apply variant adjustment if selected
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (!variant) throw new Error('Variant not found');
      basePrice += variant.priceAdjust.toNumber();
    }

    // Apply customization fees
    let customizationTotal = 0;
    if (customizationOptions.length > 0) {
      const options = await prisma.customizationOption.findMany({
        where: { id: { in: customizationOptions } }
      });
      for (const option of options) {
        customizationTotal += option.priceAdjust.toNumber();
      }
    }

    let unitPrice = basePrice + customizationTotal;

    // Apply corporate discount if relevant
    if (corporateDiscountApplied && product.isCorporate) {
      // Mock corporate discount rule (e.g., 10% off)
      unitPrice = unitPrice * 0.9;
    }

    const subtotal = unitPrice * quantity;
    // For now, mock flat tax (10%) and delivery
    const tax = subtotal * 0.1;
    const delivery = 15;

    return {
      basePrice,
      customizationFees: customizationTotal,
      unitPrice,
      quantity,
      subtotal,
      tax,
      deliveryFee: delivery,
      total: subtotal + tax + delivery,
    };
  }
}
