'use client';

export default function AdminTable({ admins, onRemove }) {
  if (!admins || admins.length === 0) {
    return (
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
        No admin accounts created yet. Click &quot;Add Admin&quot; to create login credentials for your clients.
      </div>
    );
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
            <tr>
              <th className="px-5 py-3.5">Username</th>
              <th className="px-5 py-3.5">Password</th>
              <th className="px-5 py-3.5">Telegram ID</th>
              <th className="px-5 py-3.5">Name / Note</th>
              <th className="px-5 py-3.5">Expires</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {admins.map((admin) => (
              <tr key={admin.id || admin.username} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-5 py-3.5 font-medium text-white">
                  <span className="text-telegram font-mono">@{admin.username}</span>
                </td>
                <td className="px-5 py-3.5 text-gray-300 font-mono text-xs">
                  <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700/60">
                    {admin.password || '••••••'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">
                  <code>{admin.telegram_user_id || admin.user_id}</code>
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
  );
}
