import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/services/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ success: false, error: 'Authorization code is missing.' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ success: false, error: 'Google Client configuration missing on server.' }, { status: 500 });
    }

    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';
    const redirectUri = `${redirectUrl}/api/auth/callback/google`;

    // 1. Exchange authorization code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.json({ success: false, error: tokenData.error_description || 'Token exchange failed.' }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userRes.json();

    const email = userData.email;
    if (!email) {
      return NextResponse.json({ success: false, error: 'Could not retrieve email from Google profile.' }, { status: 400 });
    }

    // 3. Find or Create User
    const firstName = userData.given_name || userData.name || 'Google';
    const lastName = userData.family_name || 'User';

    let dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email,
          role: 'CUSTOMER',
          firstName,
          lastName,
        },
      });
    }

    // 4. Merge guest cart items
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('gormetco_session_id')?.value;
    if (sessionId) {
      const guestCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      });

      if (guestCart && guestCart.items.length > 0) {
        let userCart = await prisma.cart.findUnique({
          where: { userId: dbUser.id },
        });

        if (!userCart) {
          userCart = await prisma.cart.create({
            data: { userId: dbUser.id },
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

    // 5. Set HTTP-only session cookie on the redirect response
    const redirectResponse = NextResponse.redirect(new URL('/', redirectUrl));
    redirectResponse.cookies.set('gormetco_user_id', dbUser.id, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return redirectResponse;
  } catch (error: any) {
    console.error('Google callback error:', error);
    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message || 'Google OAuth callback failed')}`, redirectUrl));
  }
}
