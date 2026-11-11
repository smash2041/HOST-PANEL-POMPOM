'use client';

import { useState } from 'react';

export default function AdminTable({ admins, onRemove }) {
  const [confirmId, setConfirmId] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">User ID</th>
              <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Added At</th>
              <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Added By</th>
              <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Expires</th>
              <th className="text-right px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No hosting admins found
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.user_id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-mono text-gray-300">{admin.user_id}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{formatDate(admin.added_at)}</td>
                  <td className="px-5 py-3 text-gray-400">{admin.added_by || 'System'}</td>
                  <td className="px-5 py-3">
                    <span className={admin.expires_at ? 'text-yellow-400' : 'text-gray-500'}>
                      {admin.expires_at ? formatDate(admin.expires_at) : 'Never'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {confirmId === admin.user_id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { onRemove(admin.user_id); setConfirmId(null); }}
                          className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(admin.user_id)}
                        className="px-3 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
