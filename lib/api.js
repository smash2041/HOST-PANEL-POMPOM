// Client-side API helpers

export async function apiGet(path) {
  const res = await fetch(path, {
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPost(path, body = {}) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Proxy helpers — route through /api/proxy?endpoint=... → EC2
export async function ec2Get(endpoint) {
  return apiGet(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`);
}

export async function ec2Post(endpoint, body = {}) {
  return apiPost(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, body);
}

// Get current user session
export async function getMe() {
  try {
    return await apiGet('/api/me');
  } catch {
    return null;
  }
}
