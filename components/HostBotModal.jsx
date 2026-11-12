'use client';

import { useState } from 'react';
import { ec2Post } from '@/lib/api';

export default function HostBotModal({ onClose, onSuccess, onToast, userId, isOwner }) {
  const [token, setToken] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      onToast?.('Bot token is required', 'error');
      return;
    }
    setLoading(true);
    try {
      let data;
      if (isOwner) {
        // Owner uses admin host endpoint
        const body = { token: token.trim() };
        if (ownerUserId.trim()) {
          body.owner_user_id = parseInt(ownerUserId.trim());
          body.creator_user_id = parseInt(ownerUserId.trim());
        } else if (userId) {
          body.owner_user_id = parseInt(userId);
          body.creator_user_id = parseInt(userId);
        }
        if (expiresAt) body.expires_at = expiresAt.replace('T', ' ') + ':00';
        data = await ec2Post('/bots/host', body);
      } else {
        // Customer uses customer/host endpoint
        const myId = parseInt(userId) || 0;
        const targetId = ownerUserId.trim() ? parseInt(ownerUserId.trim()) : myId;
        if (!targetId || targetId === 0) {
          onToast?.('Kripya Bot Admin Telegram User ID daalein jisko /admin access chahiye', 'error');
          setLoading(false);
          return;
        }
        const body = {
          token: token.trim(),
          admin_user_id: myId,         // Panel Admin (creator - limit deducted from here)
          target_owner_id: targetId,   // Bot Admin (gets /admin rights in Telegram)
        };
        if (expiresAt) body.expires_at = expiresAt.replace('T', ' ') + ':00';
        data = await ec2Post('/customer/host', body);
      }
      onToast?.('Bot hosted successfully! 🎉', 'success');
      onSuccess?.(data.bot);
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">🤖 Host New Bot</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Bot Token *</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456789:ABCdefGhIjKlMnOpQrStUvWxYz"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-telegram transition-colors text-sm font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5 flex items-center justify-between">
              <span>Bot Admin Telegram User ID (optional)</span>
              <span className="text-xs text-telegram font-mono">/admin access</span>
            </label>
            <input
              type="number"
              value={ownerUserId}
              onChange={(e) => setOwnerUserId(e.target.value)}
              placeholder={isOwner ? "Telegram User ID (khali chhodne par aapka banega)" : "Dusri ID daalein agar kisi aur ko /admin dena hai"}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-telegram transition-colors text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {isOwner
                ? "Jisko is bot ka Telegram /admin banana hai uski ID daalein (khali chhodne par aapki ID lagegi)."
                : "Agar aap kisi aur account ko bot ka /admin banana chahte ho to uski Telegram ID yahan daalo. Khali chhodoge to aapke account par /admin milega."}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Expiry Date (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-telegram transition-colors text-sm [color-scheme:dark]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-telegram text-white rounded-xl hover:bg-telegram-dark transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Hosting...
                </span>
              ) : (
                '🚀 Host Bot'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
