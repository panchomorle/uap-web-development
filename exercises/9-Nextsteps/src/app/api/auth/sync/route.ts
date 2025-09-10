import { NextResponse } from 'next/server';
import { getUserFromToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';

// API route to sync client authentication state with server state
export async function GET() {
  // Get the auth token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  console.log('[API] Auth sync request, token exists:', !!token);
  
  if (!token) {
    console.log('[API] No token in cookies, returning unauthenticated');
    return NextResponse.json({ authenticated: false, syncedAt: new Date().toISOString() }, { status: 200 });
  }
  
  // Verify token
  try {
    const user = await getUserFromToken(token);
    
    if (!user) {
      console.log('[API] Invalid token, returning unauthenticated');
      return NextResponse.json({ 
        authenticated: false, 
        syncedAt: new Date().toISOString() 
      }, { status: 200 });
    }
    
    // The user object here is actually the JWT payload, not a MongoDB user object
    console.log('[API] Valid token for user:', user.username);
    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email || ''
      },
      token, // Return token so client can store it
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Error during auth sync:', error);
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Authentication error',
      syncedAt: new Date().toISOString() 
    }, { status: 500 });
  }
}
