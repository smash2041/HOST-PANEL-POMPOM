'use client';

import { useState } from 'react';

export default function AddAdminModal({ onClose, onSuccess, onToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [telegramUserId, setTelegramUserId] = useState('');
  const [botLimit, setBotLimit] = useState(1);
  const [name, setName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      onToast?.('Username and Password are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/panel-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          telegram_user_id: telegramUserId.trim() ? parseInt(telegramUserId.trim()) : 0,
          bot_limit: Math.max(1, parseInt(botLimit) || 1),
          name: name.trim(),
          expires_at: expiresAt ? expiresAt.replace('T', ' ') + ':00' : '',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');

      onToast?.(`Admin account created for @${username} (Limit: ${botLimit} bots)! 🎉`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>👤</span> Create Admin Login
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Username *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. rahul_admin"
              className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-telegram text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Password *</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. pass@1234"
              className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-telegram text-sm font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Telegram User ID <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                value={telegramUserId}
                onChange={(e) => setTelegramUserId(e.target.value)}
                placeholder="Khali chhod sakte ho (optional)"
                className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-telegram text-sm"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Zaroori nahi hai — client bot banate waqt jiski bhi ID daalega, /admin usi ko milega.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Bot Limit (Default: 1)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={botLimit}
                onChange={(e) => setBotLimit(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-telegram text-sm font-bold text-telegram"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Customer Name / Note (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-telegram text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Expiry Date (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-telegram text-sm [color-scheme:dark]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-telegram text-white rounded-xl hover:bg-telegram-dark transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
