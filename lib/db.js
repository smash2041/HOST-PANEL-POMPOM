import { createClient } from '@libsql/client';

let client = null;

export function getDB() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

// Get all hosted bots (strips bot_token)
export async function getAllBots() {
  const db = getDB();
  const result = await db.execute(
    'SELECT id, bot_username, owner_user_id, table_prefix, status, created_at, expires_at, stopped_at, stopped_reason FROM hosted_bots ORDER BY created_at DESC'
  );
  return result.rows;
}

// Get bots by owner (strips bot_token)
export async function getBotsByOwner(ownerUserId) {
  const db = getDB();
  const result = await db.execute({
    sql: 'SELECT id, bot_username, owner_user_id, table_prefix, status, created_at, expires_at, stopped_at, stopped_reason FROM hosted_bots WHERE owner_user_id = ?',
    args: [ownerUserId],
  });
  return result.rows;
}

// Get a single bot by ID (strips bot_token)
export async function getBotById(botId) {
  const db = getDB();
  const result = await db.execute({
    sql: 'SELECT id, bot_username, owner_user_id, table_prefix, status, created_at, expires_at, stopped_at, stopped_reason FROM hosted_bots WHERE id = ?',
    args: [botId],
  });
  return result.rows[0] || null;
}

// Get all hosting admins
export async function getAllAdmins() {
  const db = getDB();
  const result = await db.execute(
    'SELECT user_id, added_at, added_by, expires_at FROM hosting_admins ORDER BY added_at DESC'
  );
  return result.rows;
}

// Check if a user is a hosting admin
export async function isHostingAdmin(userId) {
  const db = getDB();
  const result = await db.execute({
    sql: 'SELECT user_id FROM hosting_admins WHERE user_id = ?',
    args: [userId],
  });
  return result.rows.length > 0;
}

// Get hosting logs
export async function getHostingLogs(limit = 50) {
  const db = getDB();
  const result = await db.execute({
    sql: 'SELECT id, bot_id, action, performed_by, details, created_at FROM hosting_logs ORDER BY created_at DESC LIMIT ?',
    args: [limit],
  });
  return result.rows;
}

// Get logs for a specific bot
export async function getBotLogs(botId) {
  const db = getDB();
  const result = await db.execute({
    sql: 'SELECT id, bot_id, action, performed_by, details, created_at FROM hosting_logs WHERE bot_id = ? ORDER BY created_at DESC',
    args: [botId],
  });
  return result.rows;
}

// Get overall stats from DB
export async function getDBStats() {
  const db = getDB();
  const [totalBots, activeBots, stoppedBots, expiredBots, totalAdmins] = await Promise.all([
    db.execute('SELECT COUNT(*) as count FROM hosted_bots'),
    db.execute("SELECT COUNT(*) as count FROM hosted_bots WHERE status = 'active'"),
    db.execute("SELECT COUNT(*) as count FROM hosted_bots WHERE status = 'stopped'"),
    db.execute("SELECT COUNT(*) as count FROM hosted_bots WHERE status = 'expired'"),
    db.execute('SELECT COUNT(*) as count FROM hosting_admins'),
  ]);
  return {
    total_bots: totalBots.rows[0].count,
    active_bots: activeBots.rows[0].count,
    stopped_bots: stoppedBots.rows[0].count,
    expired_bots: expiredBots.rows[0].count,
    total_admins: totalAdmins.rows[0].count,
  };
}
