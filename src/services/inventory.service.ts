import { prisma } from './db';

export class InventoryService {
  /**
   * Deducts inventory securely for a given product or variant.
   */
  static async reserveInventory(productId: string, variantId: string | null, quantity: number) {
    // In a real production system, this should run in a transaction
    return await prisma.$transaction(async (tx) => {
      if (variantId) {
        const variant = await tx.productVariant.findUnique({ where: { id: variantId } });
        if (!variant || variant.inventory < quantity) {
          throw new Error('Not enough variant inventory available');
        }
        await tx.productVariant.update({
          where: { id: variantId },
          data: { inventory: { decrement: quantity } }
        });
      } else {
        // Log generic product inventory record or deduction logic here
        await tx.inventoryRecord.create({
          data: {
            productId,
            quantity: quantity,
            type: 'RESERVE',
            notes: 'Reserved during checkout',
          }
        });
      }
      return true;
    });
  }
}
