import { NextResponse } from 'next/server';
import { createSession, COOKIE_NAME } from '@/lib/auth';
import { authenticatePanelUser } from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const cleanUser = String(username).trim();
    const cleanPass = String(password).trim();

    // 1. Check Owner login (via ENV variables)
    const ownerUser = process.env.OWNER_USERNAME || 'admin';
    const ownerPass = process.env.OWNER_PASSWORD || 'admin123';
    const ownerId = parseInt(process.env.OWNER_ID || '0');

    if (cleanUser === ownerUser && cleanPass === ownerPass) {
      const token = await createSession({
        id: ownerId,
        username: cleanUser,
        name: 'Owner',
        role: 'owner',
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: ownerId,
          username: cleanUser,
          name: 'Owner',
          role: 'owner',
        },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    // 2. Check Customer / Hosting Admin login from Turso DB (panel_users table)
    const user = await authenticatePanelUser(cleanUser, cleanPass);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check expiry if set
    if (user.expires_at) {
      const expiry = new Date(user.expires_at).getTime();
      if (!isNaN(expiry) && expiry < Date.now()) {
        return NextResponse.json(
          { error: 'Your account access has expired. Please contact admin.' },
          { status: 403 }
        );
      }
    }

    // Create session for admin
    const token = await createSession({
      id: user.telegram_user_id,
      username: user.username,
      name: user.name || user.username,
      role: 'admin',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.telegram_user_id,
        username: user.username,
        name: user.name || user.username,
        role: 'admin',
      },
    });

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
      { error: 'Authentication failed: ' + error.message },
      { status: 500 }
    );
  }
}
