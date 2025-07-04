import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    try {
      // The `auth` object from firebase-admin is the fully initialized admin auth instance.
      // If it failed to initialize, the server would not have started.
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      cookies().set('firebase-session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        path: '/',
      });
      return NextResponse.json({ status: 'success' });
    } catch (error) {
      console.error('Error creating session cookie:', error);
      // This will catch issues like invalid ID tokens.
      return NextResponse.json({ status: 'error', message: 'Failed to create session.' }, { status: 401 });
    }
  }
  return NextResponse.json({ status: 'error', message: 'Invalid authorization header.' }, { status: 400 });
}
