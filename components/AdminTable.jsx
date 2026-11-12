'use client';

import { useState, useEffect } from 'react';

// Modal displaying all bots created by a specific admin
function AdminBotsModal({ admin, bots, onClose, onBotAction, onViewInBotsTab }) {
  const adminTgIdStr = String(admin.telegram_user_id || admin.user_id || '');
  const adminDbIdStr = String(admin.id || '');
  const adminBots = bots.filter(
    (b) =>
      (adminTgIdStr && adminTgIdStr !== '0' && (String(b.creator_user_id || b.creator_id) === adminTgIdStr || String(b.owner_user_id) === adminTgIdStr)) ||
      (adminDbIdStr && String(b.creator_user_id || b.creator_id) === adminDbIdStr)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6 animate-fade-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🤖</span> Bots Hosted by{' '}
              <span className="text-telegram font-mono">@{admin.username}</span>
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span>
                Telegram ID: <code className="text-gray-300 font-mono">{admin.telegram_user_id}</code>
              </span>
              <span>•</span>
              <span>
                Usage:{' '}
                <strong className={adminBots.length >= (admin.bot_limit || 1) ? 'text-yellow-400' : 'text-green-400'}>
                  {adminBots.length} / {admin.bot_limit || 1} bots
                </strong>
              </span>
              {admin.name && (
                <>
                  <span>•</span>
                  <span>Note: {admin.name}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Bots List */}
        <div className="overflow-y-auto py-4 space-y-3 flex-1 pr-1">
          {adminBots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-sm font-medium text-gray-400">No bots created by @{admin.username} yet</p>
              <p className="text-xs text-gray-600 mt-1">
                This admin can create up to {admin.bot_limit || 1} bot(s).
              </p>
            </div>
          ) : (
            adminBots.map((bot) => (
              <div
                key={bot.id}
                className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-telegram/10 flex items-center justify-center text-xl shrink-0">
                    🤖
                  </div>
                  <div>
                    <a
                      href={`https://t.me/${bot.bot_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-white hover:text-telegram transition-colors text-sm flex items-center gap-1 group"
                    >
                      @{bot.bot_username || 'unknown'}
                      <span className="text-xs text-gray-500 group-hover:text-telegram">↗</span>
                    </a>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          bot.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : bot.status === 'stopped'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {bot.status}
                      </span>
                      <span>Created: {new Date(bot.created_at).toLocaleDateString()}</span>
                      <span className="font-mono text-gray-500">ID: {bot.id?.slice(0, 8)}</span>
                      <span className="font-mono text-gray-400 bg-gray-900/80 px-1.5 py-0.5 rounded border border-gray-700/60 text-[11px]" title="This Telegram ID has /admin access in this bot">
                        🔑 Admin: {bot.owner_user_id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-700/40">
                  {bot.status === 'active' && (
                    <button
                      onClick={() => onBotAction?.('stop', bot.id)}
                      className="px-2.5 py-1 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      ⏹ Stop
                    </button>
                  )}
                  {bot.status === 'stopped' && (
                    <button
                      onClick={() => onBotAction?.('resume', bot.id)}
                      className="px-2.5 py-1 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      ▶ Resume
                    </button>
                  )}
                  <button
                    onClick={() => onBotAction?.('delete', bot.id)}
                    className="px-2.5 py-1 text-xs font-medium bg-gray-700/60 text-gray-400 hover:text-red-400 border border-gray-600 rounded-lg transition-colors"
                    title="Delete bot"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Total {adminBots.length} bot{adminBots.length === 1 ? '' : 's'}
          </span>
          {adminBots.length > 0 && onViewInBotsTab && (
            <button
              onClick={() => {
                onViewInBotsTab(admin.telegram_user_id);
                onClose();
              }}
              className="px-3.5 py-1.5 bg-telegram/20 hover:bg-telegram/30 text-telegram border border-telegram/40 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>👉</span> View & Manage in Bots Tab
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LimitEditor({ admin, onLimitChanged, onViewBots }) {
  const [val, setVal] = useState(admin.bot_limit || 1);
  const [saving, setSaving] = useState(false);
  const activeCount = admin.active_bots || 0;

  useEffect(() => {
    setVal(admin.bot_limit || 1);
  }, [admin.bot_limit]);

  const saveLimit = async (newLimit) => {
    const num = Math.max(1, parseInt(newLimit) || 1);
    setVal(num);
    setSaving(true);
    try {
      const res = await fetch('/api/panel-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: admin.id, bot_limit: num }),
      });
      if (!res.ok) throw new Error('Failed to update limit');
      onLimitChanged?.(admin.id, num);
    } catch (err) {
      alert('Error saving limit: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isLimitFull = activeCount >= (parseInt(val) || 1);

  return (
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
      {/* Direct Editable Box */}
      <div className="inline-flex items-center gap-1.5 bg-gray-800/90 border border-gray-700 rounded-lg p-1">
        <input
          type="number"
          min="1"
          max="500"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveLimit(val);
          }}
          onBlur={() => saveLimit(val)}
          className="w-14 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-center text-sm font-bold text-telegram focus:outline-none focus:border-telegram"
          title="Direct type any number and press Enter"
        />
        <button
          onClick={() => saveLimit(val)}
          disabled={saving}
          className="px-2.5 py-1 bg-telegram/20 hover:bg-telegram/40 text-telegram border border-telegram/40 rounded text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {saving ? '...' : 'Set'}
        </button>
      </div>

      {/* Quick Jump Buttons (+1, +5) */}
      <div className="hidden sm:flex items-center gap-1">
        <button
          onClick={() => saveLimit((parseInt(val) || 1) + 1)}
          className="px-1.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300 font-mono hover:text-white transition-colors"
          title="Add +1"
        >
          +1
        </button>
        <button
          onClick={() => saveLimit((parseInt(val) || 1) + 5)}
          className="px-1.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300 font-mono hover:text-white transition-colors"
          title="Add +5"
        >
          +5
        </button>
      </div>

      {/* Clickable Active Count & View Bots Badge */}
      <button
        onClick={() => onViewBots?.(admin)}
        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap inline-flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer shadow-sm ${
          isLimitFull
            ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/25'
            : 'bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25'
        }`}
        title="Click to view all bots hosted by this admin"
      >
        <span>{activeCount} / {val} bots</span>
        <span className="text-[11px] bg-black/40 px-1.5 py-0.5 rounded border border-white/10 font-bold">
          👁️ View
        </span>
      </button>
    </div>
  );
}

export default function AdminTable({
  admins,
  bots = [],
  onRemove,
  onLimitChanged,
  onBotAction,
  onViewInBotsTab,
}) {
  const [selectedAdminForBots, setSelectedAdminForBots] = useState(null);

  if (!admins || admins.length === 0) {
    return (
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
        No admin accounts created yet. Click &quot;Add Admin&quot; to create login credentials for your clients.
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/60 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-5 py-3.5">Username</th>
                <th className="px-5 py-3.5">Password</th>
                <th className="px-5 py-3.5">Telegram ID</th>
                <th className="px-5 py-3.5">Bot Limit & Bots</th>
                <th className="px-5 py-3.5">Name / Note</th>
                <th className="px-5 py-3.5">Expires</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {admins.map((admin) => (
                <tr key={admin.id || admin.username} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-white">
                    <span className="text-telegram font-mono font-semibold">@{admin.username}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-300 font-mono text-xs">
                    <span className="bg-gray-800/90 px-2.5 py-1 rounded-md border border-gray-700/60 text-gray-300">
                      {admin.password || '••••••'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">
                    {admin.telegram_user_id && admin.telegram_user_id !== 0 ? (
                      <code>{admin.telegram_user_id}</code>
                    ) : (
                      <span className="text-gray-500 italic">None (Web Only)</span>
                    )}
                  </td>

                  {/* Limit Controller & View Bots Trigger */}
                  <td className="px-5 py-3.5">
                    <LimitEditor
                      admin={admin}
                      onLimitChanged={onLimitChanged}
                      onViewBots={(a) => setSelectedAdminForBots(a)}
                    />
                  </td>

                  <td className="px-5 py-3.5 text-gray-300 text-xs">
                    {admin.name || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {admin.expires_at ? (
                      <span className="text-yellow-400/90">{admin.expires_at}</span>
                    ) : (
                      <span className="text-gray-500">Never</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => onRemove(admin.id || admin.telegram_user_id || admin.user_id)}
                      className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin's Hosted Bots Modal */}
      {selectedAdminForBots && (
        <AdminBotsModal
          admin={selectedAdminForBots}
          bots={bots}
          onClose={() => setSelectedAdminForBots(null)}
          onBotAction={onBotAction}
          onViewInBotsTab={onViewInBotsTab}
        />
      )}
    </>
  );
}
