'use client';

import { useState } from 'react';

export default function AdminTable({ admins, onRemove, onLimitUpdated }) {
  const [updatingId, setUpdatingId] = useState(null);

  if (!admins || admins.length === 0) {
    return (
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
        No admin accounts created yet. Click &quot;Add Admin&quot; to create login credentials for your clients.
      </div>
    );
  }

  const handleUpdateLimit = async (adminId, newLimit) => {
    if (newLimit < 1) return;
    setUpdatingId(adminId);
    try {
      const res = await fetch('/api/panel-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: adminId, bot_limit: newLimit }),
      });
      if (!res.ok) throw new Error('Failed to update limit');
      onLimitUpdated?.();
    } catch (err) {
      alert('Error updating limit: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800/60 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
            <tr>
              <th className="px-5 py-3.5">Username</th>
              <th className="px-5 py-3.5">Password</th>
              <th className="px-5 py-3.5">Telegram ID</th>
              <th className="px-5 py-3.5">Bots (Active / Limit)</th>
              <th className="px-5 py-3.5">Name / Note</th>
              <th className="px-5 py-3.5">Expires</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {admins.map((admin) => {
              const currentLimit = admin.bot_limit || 1;
              const activeCount = admin.active_bots || 0;
              const isOverLimit = activeCount >= currentLimit;

              return (
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
                    <code>{admin.telegram_user_id || admin.user_id}</code>
                  </td>

                  {/* Bot Limit Increase / Decrease Controls */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center bg-gray-800/80 border border-gray-700 rounded-lg p-0.5">
                        <button
                          onClick={() => handleUpdateLimit(admin.id, currentLimit - 1)}
                          disabled={currentLimit <= 1 || updatingId === admin.id}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent font-bold text-sm transition-colors"
                          title="Decrease bot limit"
                        >
                          −
                        </button>
                        <span className="px-2.5 py-0.5 text-sm font-bold text-white min-w-[28px] text-center">
                          {currentLimit}
                        </span>
                        <button
                          onClick={() => handleUpdateLimit(admin.id, currentLimit + 1)}
                          disabled={updatingId === admin.id}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-gray-700 font-bold text-sm transition-colors"
                          title="Increase bot limit"
                        >
                          +
                        </button>
                      </div>

                      {/* Active Bots Status Badge */}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isOverLimit
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                            : 'bg-green-500/10 text-green-400 border border-green-500/30'
                        }`}
                      >
                        {activeCount} / {currentLimit}
                      </span>
                    </div>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
