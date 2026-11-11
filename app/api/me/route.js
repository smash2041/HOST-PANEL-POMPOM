import { NextResponse } from 'next/server';
import { getSession, isOwner, COOKIE_NAME } from '@/lib/auth';
import { isHostingAdmin } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = parseInt(session.id);
    const owner = isOwner(userId);
    const admin = await isHostingAdmin(userId);

    if (!owner && !admin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      id: userId,
      first_name: session.first_name,
      username: session.username || '',
      photo_url: session.photo_url || '',
      role: owner ? 'owner' : 'admin',
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
