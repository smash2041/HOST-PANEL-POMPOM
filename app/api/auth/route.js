import { NextResponse } from 'next/server';
import { verifyTelegramAuth, createSession, isOwner, COOKIE_NAME } from '@/lib/auth';
import { isHostingAdmin } from '@/lib/db';

export async function POST(request) {
  try {
    const authData = await request.json();

    // Verify Telegram auth hash
    if (!verifyTelegramAuth(authData)) {
      return NextResponse.json(
        { error: 'Invalid authentication data' },
        { status: 401 }
      );
    }

    const userId = parseInt(authData.id);
    const owner = isOwner(userId);
    const admin = await isHostingAdmin(userId);

    if (!owner && !admin) {
      return NextResponse.json(
        { error: 'Access denied. You are not authorized to use this panel.' },
        { status: 403 }
      );
    }

    // Create session
    const token = await createSession({
      id: userId,
      first_name: authData.first_name,
      username: authData.username || '',
      photo_url: authData.photo_url || '',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        first_name: authData.first_name,
        username: authData.username || '',
        photo_url: authData.photo_url || '',
        role: owner ? 'owner' : 'admin',
      },
    });

    // Set HTTP-only cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
