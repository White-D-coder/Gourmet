import { prisma } from './db';

export interface PricingInput {
  productId: string;
  variantId?: string;
  customizationOptions: string[]; // Array of option IDs selected
  quantity: number;
  corporateDiscountApplied?: boolean;
  customizationState?: any;
}

export class PricingService {
  /**
   * Calculates the exact final price breakdown for a product based on customizations.
   */
  static async calculatePrice(input: PricingInput) {
    const { productId, variantId, customizationOptions, quantity, corporateDiscountApplied, customizationState } = input;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true, category: true }
    });

    if (!product) throw new Error('Product not found');

    let basePrice = product.basePrice;

    // If this is a customized package, calculate the item additions
    let customItemsPriceTotal = 0;
    if (customizationState && customizationState['Curation Mode'] === 'Bespoke AI Concierge') {
      const itemsCount = (customizationState && typeof customizationState['Volume Limit'] === 'string')
        ? parseInt(customizationState['Volume Limit'], 10)
        : 3;
      basePrice = 150.00 + (isNaN(itemsCount) ? 3 : itemsCount) * 40.00;
      customItemsPriceTotal = 0;
    } else if (customizationState && Array.isArray(customizationState.selectedItemIds) && customizationState.selectedItemIds.length > 0) {
      const selectedItems = await prisma.product.findMany({
        where: { id: { in: customizationState.selectedItemIds } }
      });
      const priceMap = new Map(selectedItems.map(p => [p.id, p.basePrice]));
      for (const itemId of customizationState.selectedItemIds) {
        const itemPrice = priceMap.get(itemId) || 0;
        customItemsPriceTotal += itemPrice;
      }
      // If customizing a pre-curated hamper or bespoke box, charge a flat box packaging fee instead of full price, scaled by total boxes
      if (product.category?.slug === 'hampers' || product.slug === 'bespoke-gift-box') {
        const totalBoxes = (customizationState && typeof (customizationState as any).totalBoxes === 'number')
          ? (customizationState as any).totalBoxes
          : 1;
        basePrice = 45.00 * totalBoxes;
      }
    }
    
    // Apply variant adjustment if selected
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (!variant) throw new Error('Variant not found');
      basePrice += variant.priceAdjust;
    }

    // Apply customization fees
    let customizationTotal = 0;
    if (customizationOptions.length > 0) {
      const options = await prisma.customizationOption.findMany({
        where: { id: { in: customizationOptions } }
      });
      for (const option of options) {
        customizationTotal += option.priceAdjust;
      }
    }

    let unitPrice = basePrice + customizationTotal + customItemsPriceTotal;

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
