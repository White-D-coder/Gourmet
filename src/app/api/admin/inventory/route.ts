import { NextResponse } from 'next/server';
import { prisma } from '@/services/db';

export async function POST(request: Request) {
  try {
    const { productId, variantId, quantity, notes } = await request.json();

    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Product ID and adjustment quantity are required.' },
        { status: 400 }
      );
    }

    const type = quantity >= 0 ? 'ADD' : 'DEDUCT';
    const absQuantity = Math.abs(quantity);

    const record = await prisma.$transaction(async (tx) => {
      // 1. Update Variant Inventory if variantId is provided
      if (variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: variantId },
        });

        if (!variant) {
          throw new Error(`Product variant not found: ${variantId}`);
        }

        const newInventory = variant.inventory + quantity;
        if (newInventory < 0) {
          throw new Error(`Inventory cannot fall below zero. Current stock: ${variant.inventory}`);
        }

        await tx.productVariant.update({
          where: { id: variantId },
          data: { inventory: newInventory },
        });
      }

      // 2. Create Audit Inventory Record
      const newRecord = await tx.inventoryRecord.create({
        data: {
          productId,
          quantity: absQuantity,
          type,
          notes: notes || `Admin stock adjustment by ${quantity >= 0 ? 'adding' : 'deducting'} items`,
        },
      });

      return newRecord;
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('Error adjusting inventory:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to adjust inventory.' },
      { status: 500 }
    );
  }
}
