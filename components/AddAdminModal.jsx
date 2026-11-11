'use client';

import { useState } from 'react';
import { ec2Post } from '@/lib/api';

export default function AddAdminModal({ onClose, onSuccess, onToast }) {
  const [userId, setUserId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      onToast?.('User ID is required', 'error');
      return;
    }
    setLoading(true);
    try {
      const body = { user_id: parseInt(userId.trim()) };
      if (expiresAt) body.expires_at = expiresAt;

      await ec2Post('/admins', body);
      onToast?.('Admin added successfully! ✅', 'success');
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">👤 Add Admin</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Telegram User ID *</label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 123456789"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-telegram transition-colors text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Expiry Date (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-telegram transition-colors text-sm [color-scheme:dark]"
            />
            <p className="text-xs text-gray-600 mt-1">Leave empty for no expiry</p>
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
                  Adding...
                </span>
              ) : (
                '➕ Add Admin'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
