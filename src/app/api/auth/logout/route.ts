import { NextResponse } from 'next/server';

export async function GET() {
  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';
  const response = NextResponse.redirect(new URL('/', redirectUrl));
  response.cookies.set('gormetco_user_id', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
    sameSite: 'lax',
  });
  return response;
}
