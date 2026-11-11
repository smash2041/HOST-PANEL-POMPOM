import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

const JWT_SECRET = () => new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = 'hp_session';

// Verify Telegram Login Widget data
export function verifyTelegramAuth(authData) {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) throw new Error('BOT_TOKEN not configured');

  const { hash, ...data } = authData;
  if (!hash) return false;

  // Check auth_date is not too old (allow 1 day)
  const authDate = parseInt(data.auth_date);
  if (isNaN(authDate)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) return false;

  // Build check string
  const checkString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  // Create secret key from bot token
  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  // Calculate HMAC
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  return hmac === hash;
}

// Create JWT session token
export async function createSession(user) {
  const token = await new SignJWT({
    id: user.id,
    first_name: user.first_name,
    username: user.username || '',
    photo_url: user.photo_url || '',
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
