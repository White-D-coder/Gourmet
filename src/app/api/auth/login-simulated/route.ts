import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/services/db';

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, role, phone } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Find or create User record
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: role || 'CUSTOMER',
          firstName: firstName || null,
          lastName: lastName || null,
          phone: phone || null,
        },
      });
    }

    const cookieStore = await cookies();

    // Merge guest cart items into user's cart if any
    const sessionId = cookieStore.get('gormetco_session_id')?.value;
    if (sessionId) {
      const guestCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      });

      if (guestCart && guestCart.items.length > 0) {
        let userCart = await prisma.cart.findUnique({
          where: { userId: user.id },
        });

        if (!userCart) {
          userCart = await prisma.cart.create({
            data: { userId: user.id },
          });
        }

        for (const guestItem of guestCart.items) {
          const targetStateStr = guestItem.customizationState ? JSON.stringify(guestItem.customizationState) : null;
          const userItems = await prisma.cartItem.findMany({
            where: { cartId: userCart.id, productId: guestItem.productId },
          });

          const matchingUserItem = userItems.find((item) => {
            const itemStateStr = item.customizationState ? JSON.stringify(item.customizationState) : null;
            return itemStateStr === targetStateStr;
          });

          if (matchingUserItem) {
            await prisma.cartItem.update({
              where: { id: matchingUserItem.id },
              data: { quantity: matchingUserItem.quantity + guestItem.quantity },
            });
          } else {
            await prisma.cartItem.create({
              data: {
                cartId: userCart.id,
                productId: guestItem.productId,
                quantity: guestItem.quantity,
                customizationState: guestItem.customizationState,
                priceSnapshot: guestItem.priceSnapshot,
              },
            });
          }
        }

        // Clean up guest cart items
        await prisma.cartItem.deleteMany({
          where: { cartId: guestCart.id },
        });
      }
    }

    // Build response and set cookie ON the response object (required in Next.js route handlers)
    const response = NextResponse.json({ success: true, user });
    response.cookies.set('gormetco_user_id', user.id, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Simulated login error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to authenticate' }, { status: 500 });
  }
}
