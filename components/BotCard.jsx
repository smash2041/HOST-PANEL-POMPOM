'use client';

export default function BotCard({ bot, onAction, isOwner = false }) {
  const statusConfig = {
    active: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400', label: '🟢 Active' },
    stopped: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400', label: '🔴 Stopped' },
    expired: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400', label: '🟡 Expired' },
    deleted: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', dot: 'bg-gray-400', label: '⚫ Deleted' },
  };

  const status = statusConfig[bot.status] || statusConfig.stopped;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all animate-fade-in`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-telegram/10 flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h3 className="font-semibold text-white">
              @{bot.bot_username || 'unknown'}
            </h3>
            <p className="text-xs text-gray-500">ID: {bot.id?.slice(0, 8)}...</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.border} border ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className="text-gray-500 text-xs">Owner</span>
          <p className="text-gray-300">{bot.owner_user_id}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Created</span>
          <p className="text-gray-300">{formatDate(bot.created_at)}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Expires</span>
          <p className="text-gray-300">{formatDate(bot.expires_at)}</p>
        </div>
        {bot.stopped_at && (
          <div>
            <span className="text-gray-500 text-xs">Stopped</span>
            <p className="text-gray-300">{formatDate(bot.stopped_at)}</p>
          </div>
        )}
      </div>

      {bot.stopped_reason && (
        <div className="mb-4 text-xs text-gray-500 bg-gray-800/50 rounded-lg px-3 py-2">
          💬 {bot.stopped_reason}
        </div>
      )}

      {/* Actions */}
      {onAction && (
        <div className="flex gap-2 pt-3 border-t border-gray-800">
          {bot.status === 'active' && (
            <button
              onClick={() => onAction('stop', bot.id)}
              className="flex-1 px-3 py-2 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              ⏹ Stop
            </button>
          )}
          {(bot.status === 'stopped' || bot.status === 'expired') && (
            <button
              onClick={() => onAction('resume', bot.id)}
              className="flex-1 px-3 py-2 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              ▶ Resume
            </button>
          )}
          {bot.status !== 'deleted' && (
            <button
              onClick={() => onAction('delete', bot.id)}
              className="flex-1 px-3 py-2 text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            >
              🗑 Delete
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => onAction('stats', bot.id)}
              className="flex-1 px-3 py-2 text-xs font-medium bg-telegram/10 text-telegram border border-telegram/30 rounded-lg hover:bg-telegram/20 transition-colors"
            >
              📊 Stats
            </button>
          )}
        </div>
      )}
    </div>
  );
}
