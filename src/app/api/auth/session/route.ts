import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/services/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('gormetco_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ success: true, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ success: true, user: null });
    }

    // Also get the user's cart size if any
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    const cartCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
      cartCount,
    });
  } catch (error: any) {
    console.error('Session API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch session' }, { status: 500 });
  }
}
