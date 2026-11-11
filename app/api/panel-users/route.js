import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllPanelUsers, createPanelUser, deletePanelUser } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const users = await getAllPanelUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, telegram_user_id, name, expires_at } = body;

    if (!username || !password || !telegram_user_id) {
      return NextResponse.json(
        { error: 'Username, password, and Telegram User ID are required' },
        { status: 400 }
      );
    }

    await createPanelUser({
      username: String(username).trim(),
      password: String(password).trim(),
      telegram_user_id: parseInt(telegram_user_id),
      name: name ? String(name).trim() : '',
      expires_at: expires_at || '',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: error.message.includes('UNIQUE') ? 'Username already exists' : error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await deletePanelUser(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
