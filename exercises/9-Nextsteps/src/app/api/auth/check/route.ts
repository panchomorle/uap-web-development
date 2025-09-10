import { NextResponse } from 'next/server';
import { getUserFromToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';

// API route to check authentication status
export async function GET() {
  // Get the auth token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  
  // Verify token
  const user = await getUserFromToken(token);
  
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  
  return NextResponse.json({ authenticated: true, user });
}
