import { NextResponse } from 'next/server';
import { prisma } from '@/services/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    // Resolve products for all items
    const itemsWithDetails = await Promise.all(
      order.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true },
        });

        // Resolve nested curated product details
        const customState = item.customizationState as any || {};
        let selectedProducts: any[] = [];
        if (customState && Array.isArray(customState.selectedItemIds) && customState.selectedItemIds.length > 0) {
          const products = await prisma.product.findMany({
            where: {
              id: { in: customState.selectedItemIds }
            },
            include: { category: true }
          });
          const productMap = new Map(products.map(p => [p.id, p]));
          selectedProducts = customState.selectedItemIds
            .map((uid: string) => productMap.get(uid))
            .filter(Boolean);
        }

        return {
          ...item,
          product,
          selectedProducts,
        };
      })
    );

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: itemsWithDetails,
      },
    });
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order.' },
      { status: 500 }
    );
  }
}
