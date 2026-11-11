import { NextResponse } from 'next/server';
import { getSession, COOKIE_NAME } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = parseInt(session.id || '0');
    const role = session.role === 'owner' ? 'owner' : 'admin';

    return NextResponse.json({
      id: userId,
      first_name: session.name || session.username || 'User',
      username: session.username || '',
      role: role,
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
