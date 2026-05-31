import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/services/db';
import { PricingService } from '@/services/pricing.service';
import { InventoryService } from '@/services/inventory.service';
import { OrderStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    // Auth Guard — reject if user is not signed in
    const userId = cookieStore.get('gormetco_user_id')?.value;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to place an order.' },
        { status: 401 }
      );
    }

    // Verify user exists in DB
    const loggedInUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!loggedInUser) {
      return NextResponse.json(
        { success: false, error: 'Session invalid. Please sign in again.' },
        { status: 401 }
      );
    }

    const sessionId = cookieStore.get('gormetco_session_id')?.value;

    // Get cart — try user cart first, fallback to guest session cart
    const cartWhereConditions = [{ userId: loggedInUser.id }];
    if (sessionId) {
      cartWhereConditions.push({ sessionId } as any);
    }

    const cart = await prisma.cart.findFirst({
      where: { OR: cartWhereConditions },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Your cart is empty.' },
        { status: 400 }
      );
    }

    const { customerDetails, deliveryDetails, paymentDetails } = await request.json();

    if (!customerDetails || !deliveryDetails) {
      return NextResponse.json(
        { success: false, error: 'Customer details and delivery details are required.' },
        { status: 400 }
      );
    }

    // Use the authenticated session user directly
    const dbUser = loggedInUser;

    // 1. Process items: validate inventory & compute correct prices
    const orderItemsToCreate: Array<{
      productId: string;
      quantity: number;
      priceSnapshot: number;
      customizationState: any;
      variantId: string | null;
    }> = [];
    let calculatedSubtotal = 0;

    for (const item of cart.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true, customizations: { include: { options: true } } },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      // Check if a specific variant ID was selected in the customizationState
      const customState = item.customizationState as any || {};
      let selectedVariant = product.variants[0]; // fallback to default standard variant
      
      if (customState.variantId) {
        const found = product.variants.find((v) => v.id === customState.variantId);
        if (found) selectedVariant = found;
      }

      // Validate stock
      if (selectedVariant && selectedVariant.inventory < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Not enough stock for ${product.name} (${selectedVariant.name}). Available: ${selectedVariant.inventory}.`,
          },
          { status: 400 }
        );
      }

      // Collect customization option IDs to calculate prices correctly
      const selectedOptionIds: string[] = [];
      if (product.customizations) {
        for (const schema of product.customizations) {
          const selectedOptionName = customState[schema.name];
          if (selectedOptionName) {
            const matchedOption = schema.options.find((o) => o.label === selectedOptionName);
            if (matchedOption) {
              selectedOptionIds.push(matchedOption.id);
            }
          }
        }
      }

      // Call PricingService to calculate price breakdown securely
      const priceBreakdown = await PricingService.calculatePrice({
        productId: product.id,
        variantId: selectedVariant?.id,
        customizationOptions: selectedOptionIds,
        quantity: item.quantity,
        customizationState: item.customizationState,
      });

      calculatedSubtotal += priceBreakdown.subtotal;

      // Add to transactional create list
      orderItemsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        priceSnapshot: priceBreakdown.unitPrice,
        customizationState: item.customizationState || null,
        variantId: selectedVariant?.id || null,
      });
    }

    // Calculations
    const taxAmount = calculatedSubtotal * 0.1; // 10% tax
    const deliveryFee = 15.00; // Flat fee
    const totalAmount = calculatedSubtotal + taxAmount + deliveryFee;

    // Run Order creation and inventory deduction in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Deduct inventory for all items
      for (const itemToDeduct of orderItemsToCreate) {
        await InventoryService.reserveInventory(
          itemToDeduct.productId,
          itemToDeduct.variantId,
          itemToDeduct.quantity
        );
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: dbUser?.id || null,
          status: OrderStatus.PAID, // Set to PAID directly for simulation
          totalAmount,
          taxAmount,
          deliveryFee,
          customerDetails: customerDetails,
          deliveryDetails: deliveryDetails,
          items: {
            create: orderItemsToCreate.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceSnapshot: item.priceSnapshot,
              customizationState: item.customizationState,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Clear the Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Checkout failed.' },
      { status: 500 }
    );
  }
}
