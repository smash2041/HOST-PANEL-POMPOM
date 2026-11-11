import { NextResponse } from 'next/server';
import { getSession, isOwner } from '@/lib/auth';
import { isHostingAdmin } from '@/lib/db';

export async function GET(request) {
  return handleProxy(request);
}

export async function POST(request) {
  return handleProxy(request);
}

async function handleProxy(request) {
  try {
    // Verify session
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

    // Get the target endpoint from query param ?endpoint=/bots
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || '';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const targetPath = `/panel${cleanEndpoint}`;
    const ec2Url = process.env.EC2_API_URL;
    const url = `${ec2Url}${targetPath}`;

    // Forward the request
    const fetchOptions = {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${process.env.PANEL_API_SECRET}`,
        'Content-Type': 'application/json',
        'X-Panel-User': String(userId),
      },
    };

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {
        // No body or invalid JSON — that's okay
      }
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    // Strip bot_token from any response data
    const sanitized = stripTokens(data);

    return NextResponse.json(sanitized, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to reach server: ' + error.message },
      { status: 502 }
    );
  }
}

// Recursively strip bot_token fields
function stripTokens(obj) {
  if (Array.isArray(obj)) {
    return obj.map(stripTokens);
  }
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'bot_token') continue;
      cleaned[key] = stripTokens(value);
    }
    return cleaned;
  }
  return obj;
}
