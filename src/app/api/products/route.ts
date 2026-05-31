import { NextResponse } from 'next/server';
import { prisma } from '@/services/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const collectionSlug = searchParams.get('collection');
    const isCorporate = searchParams.get('isCorporate');
    const featuredOnly = searchParams.get('featured') === 'true';

    const where: any = {};
    
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (collectionSlug) {
      where.collection = { slug: collectionSlug };
    }
    if (isCorporate !== null) {
      where.isCorporate = isCorporate === 'true';
    }
    if (featuredOnly) {
      where.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: true,
        customizations: {
          include: {
            options: true,
          },
        },
        category: true,
        collection: true,
      },
      orderBy: {
        basePrice: 'asc',
      },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
