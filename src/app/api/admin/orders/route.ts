import { NextResponse } from 'next/server';
import { prisma } from '@/services/db';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Hydrate item details
    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        const itemsWithProduct = await Promise.all(
          order.items.map(async (item) => {
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
            });
            return {
              ...item,
              product,
            };
          })
        );
        return {
          ...order,
          items: itemsWithProduct,
        };
      })
    );

    return NextResponse.json({ success: true, orders: ordersWithProducts });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and new status are required.' },
        { status: 400 }
      );
    }

    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid OrderStatus: ${status}` },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status.' },
      { status: 500 }
    );
  }
}
