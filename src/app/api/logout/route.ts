import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  cookies().delete('firebase-session');
  return NextResponse.json({ status: 'success' });
}
