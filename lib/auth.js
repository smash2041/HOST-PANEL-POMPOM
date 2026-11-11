import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = () => new TextEncoder().encode(process.env.JWT_SECRET || 'default_jwt_secret_pompom_123');
const COOKIE_NAME = 'hp_session';

// Create JWT session token
export async function createSession(user) {
  const token = await new SignJWT({
    id: user.id, // telegram_user_id
    username: user.username,
    name: user.name || user.username,
    role: user.role, // 'owner' or 'admin'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET());

  return token;
}

// Verify JWT and return user data
export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET());
    return payload;
  } catch {
    return null;
  }
}

// Get session from request cookies
export async function getSession(request) {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie) return null;
  return verifySession(cookie.value);
}

// Check if user is the owner
export function isOwner(userId) {
  return String(userId) === String(process.env.OWNER_ID);
}

export { COOKIE_NAME };
