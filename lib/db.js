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

// Ensure panel_users table exists
let tablesInitialized = false;
export async function initPanelTables() {
  if (tablesInitialized) return;
  const db = getDB();
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS panel_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        telegram_user_id INTEGER NOT NULL,
        name TEXT DEFAULT '',
        role TEXT DEFAULT 'admin',
        created_at TEXT DEFAULT (datetime('now')),
        expires_at TEXT DEFAULT ''
      )
    `);
    tablesInitialized = true;
  } catch (err) {
    console.error('Failed to init panel tables:', err);
  }
}

// Authenticate panel user by username and password
export async function authenticatePanelUser(username, password) {
  await initPanelTables();
  const db = getDB();
  const result = await db.execute({
    sql: 'SELECT id, username, password, telegram_user_id, name, role, expires_at FROM panel_users WHERE username = ? AND password = ?',
    args: [username, password],
  });
  return result.rows[0] || null;
}

// Get all panel users (for Owner admin view)
export async function getAllPanelUsers() {
  await initPanelTables();
  const db = getDB();
  const result = await db.execute(
    'SELECT id, username, password, telegram_user_id, name, role, created_at, expires_at FROM panel_users ORDER BY created_at DESC'
  );
  return result.rows;
}

// Create a new panel user (login credentials for customer/admin)
export async function createPanelUser({ username, password, telegram_user_id, name = '', expires_at = '' }) {
  await initPanelTables();
  const db = getDB();
  await db.execute({
    sql: 'INSERT INTO panel_users (username, password, telegram_user_id, name, expires_at) VALUES (?, ?, ?, ?, ?)',
    args: [username, password, telegram_user_id, name, expires_at],
  });
  // Also register in hosting_admins table so bot allows hosting access
  try {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO hosting_admins (user_id, expires_at) VALUES (?, ?)',
      args: [telegram_user_id, expires_at],
    });
  } catch (e) {
    // Ignore if duplicate
  }
  return true;
}

// Delete panel user
export async function deletePanelUser(id) {
  await initPanelTables();
  const db = getDB();
  const user = await db.execute({
    sql: 'SELECT telegram_user_id FROM panel_users WHERE id = ?',
    args: [id],
  });
  if (user.rows.length > 0) {
    const tgId = user.rows[0].telegram_user_id;
    try {
      await db.execute({
        sql: 'DELETE FROM hosting_admins WHERE user_id = ?',
        args: [tgId],
      });
    } catch {}
  }
  await db.execute({
    sql: 'DELETE FROM panel_users WHERE id = ?',
    args: [id],
  });
  return true;
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
