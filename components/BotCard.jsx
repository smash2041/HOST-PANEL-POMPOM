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
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all animate-fade-in flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-telegram/10 flex items-center justify-center text-xl shrink-0">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                {bot.bot_username ? (
                  <a
                    href={`https://t.me/${bot.bot_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white hover:text-telegram transition-colors flex items-center gap-1"
                    title="Open bot in Telegram"
                  >
                    @{bot.bot_username}
                    <span className="text-xs text-gray-500 hover:text-telegram">↗</span>
                  </a>
                ) : (
                  <h3 className="font-semibold text-white">unknown</h3>
                )}
              </div>
              <p className="text-xs text-gray-500 font-mono">ID: {bot.id?.slice(0, 8)}...</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.border} border ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <span className="text-gray-500 text-xs block mb-0.5">Created By (Panel)</span>
            <div className="flex items-center gap-1 flex-wrap">
              {bot.admin_username ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-telegram/15 text-telegram font-mono text-xs font-semibold border border-telegram/30" title={`Creator Telegram ID: ${bot.creator_user_id || bot.owner_user_id}`}>
                  👤 @{bot.admin_username}
                </span>
              ) : bot.is_owner_bot ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-400 font-mono text-xs font-semibold border border-yellow-500/30">
                  👑 Owner (You)
                </span>
              ) : (
                <span className="text-gray-400 font-mono text-xs bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700/60" title="Creator Telegram ID">
                  ID: {bot.creator_user_id || bot.owner_user_id}
                </span>
              )}
              {bot.admin_name && (
                <span className="text-xs text-gray-400 truncate max-w-[80px]" title={bot.admin_name}>
                  ({bot.admin_name})
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-xs block mb-0.5">Bot Admin (/admin)</span>
            <div className="flex items-center gap-1">
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded border ${
                  bot.creator_user_id && String(bot.creator_user_id) !== String(bot.owner_user_id)
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                    : 'bg-gray-800/80 text-gray-300 border-gray-700/60'
                }`}
                title="This Telegram User ID has /admin rights in this bot"
              >
                🔑 {bot.owner_user_id}
              </span>
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-xs block mb-0.5">Created</span>
            <p className="text-gray-300 text-xs font-mono">{formatDate(bot.created_at)}</p>
          </div>
          <div>
            <span className="text-gray-500 text-xs block mb-0.5">Expires</span>
            <p className="text-gray-300 text-xs font-mono">{formatDate(bot.expires_at)}</p>
          </div>
          {bot.stopped_at && (
            <div className="col-span-2">
              <span className="text-gray-500 text-xs block mb-0.5">Stopped</span>
              <p className="text-gray-300 text-xs font-mono">{formatDate(bot.stopped_at)}</p>
            </div>
          )}
        </div>

        {bot.stopped_reason && (
          <div className="mb-4 text-xs text-gray-500 bg-gray-800/50 rounded-lg px-3 py-2">
            💬 {bot.stopped_reason}
          </div>
        )}
      </div>

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
