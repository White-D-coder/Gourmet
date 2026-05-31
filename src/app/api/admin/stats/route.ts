import { NextResponse } from 'next/server';
import { prisma } from '@/services/db';
import { OrderStatus, InquiryStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Calculate Revenue (for paid/completed orders)
    const paidOrders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.PACKED, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
        },
      },
      select: {
        totalAmount: true,
      },
    });

    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    // 2. Count Orders
    const totalOrders = await prisma.order.count();

    // 3. Count Pending Inquiries (excluding FULFILLED/LOST/WON status)
    const pendingInquiriesCount = await prisma.inquiry.count({
      where: {
        status: {
          in: [InquiryStatus.NEW, InquiryStatus.REVIEWING, InquiryStatus.CONTACTED, InquiryStatus.PROPOSAL_SENT, InquiryStatus.NEGOTIATION],
        },
      },
    });

    // 4. Low stock count (inventory < 10 on variants)
    const lowStockCount = await prisma.productVariant.count({
      where: {
        inventory: {
          lt: 10,
        },
      },
    });

    // 5. Recent orders
    const recentOrders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // 6. Recent inquiries
    const recentInquiries = await prisma.inquiry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // 7. Get products list with their stock levels for the inventory sub-panel
    const productsInventory = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        revenue,
        totalOrders,
        pendingInquiries: pendingInquiriesCount,
        lowStockCount,
        recentOrders,
        recentInquiries,
        productsInventory,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin stats.' },
      { status: 500 }
    );
  }
}
