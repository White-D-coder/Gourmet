import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/services/db';

async function getOrCreateSessionId() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('gormetco_session_id')?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set('gormetco_session_id', sessionId, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });
  }
  return sessionId;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('gormetco_user_id')?.value;

    let cart;
    if (userId) {
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: true,
        },
      });
    } else {
      const sessionId = await getOrCreateSessionId();
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: true,
        },
      });
    }

    if (!cart) {
      return NextResponse.json({ success: true, items: [] });
    }

    // Load full product details for each item to render beautifully in UI
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
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
            .map((id: string) => productMap.get(id))
            .filter(Boolean);
        }

        return {
          ...item,
          product,
          selectedProducts,
        };
      })
    );

    return NextResponse.json({ success: true, items: itemsWithDetails });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { productId, quantity, customizationState, priceSnapshot } = await request.json();

    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Product ID and quantity are required.' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get('gormetco_user_id')?.value;

    // Find or create cart
    let cart;
    if (userId) {
      cart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
        });
      }
    } else {
      const sessionId = await getOrCreateSessionId();
      cart = await prisma.cart.findUnique({
        where: { sessionId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { sessionId },
        });
      }
    }

    // Helper to stringify and normalize customization states for match checks
    const targetStateStr = customizationState ? JSON.stringify(customizationState) : null;

    // Fetch existing items in the cart
    const existingItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id, productId },
    });

    // Find if there is an item with identical customization state
    const matchingItem = existingItems.find(
      (item) => {
        const itemStateStr = item.customizationState ? JSON.stringify(item.customizationState) : null;
        return itemStateStr === targetStateStr;
      }
    );

    if (quantity <= 0) {
      // Remove item if quantity is zero/negative
      if (matchingItem) {
        await prisma.cartItem.delete({
          where: { id: matchingItem.id },
        });
      }
    } else if (matchingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: matchingItem.id },
        data: { quantity },
      });
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          customizationState: customizationState || null,
          priceSnapshot: priceSnapshot || 0,
        },
      });
    }

    // Return the updated cart items
    let updatedCart;
    if (userId) {
      updatedCart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });
    } else {
      const sessionId = await getOrCreateSessionId();
      updatedCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      });
    }

    const itemsWithDetails = await Promise.all(
      (updatedCart?.items || []).map(async (item) => {
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
            .map((id: string) => productMap.get(id))
            .filter(Boolean);
        }

        return {
          ...item,
          product,
          selectedProducts,
        };
      })
    );

    return NextResponse.json({ success: true, items: itemsWithDetails });
  } catch (error: any) {
    console.error('Error modifying cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to modify cart' },
      { status: 500 }
    );
  }
}
