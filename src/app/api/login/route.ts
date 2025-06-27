import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    if (!auth.createSessionCookie) {
        const errorMessage = "Firebase Admin SDK is not configured. Server-side authentication cannot be completed. Please ensure FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are set in your environment variables.";
        console.error(errorMessage);
        return NextResponse.json({ status: 'error', message: errorMessage }, { status: 503 });
    }

    try {
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
      return NextResponse.json({ status: 'error' }, { status: 401 });
    }
  }
  return NextResponse.json({ status: 'error' }, { status: 400 });
}
