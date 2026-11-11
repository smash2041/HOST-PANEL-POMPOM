'use client';

import { useState } from 'react';
import { ec2Post } from '@/lib/api';

export default function DeadBotChecker({ onToast }) {
  const [checking, setChecking] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [results, setResults] = useState(null);

  const handleCheck = async () => {
    setChecking(true);
    setResults(null);
    try {
      const data = await ec2Post('/bots/check-dead');
      setResults(data);
      onToast?.('Check completed!', 'success');
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setChecking(false);
    }
  };

  const handleClean = async () => {
    if (!results?.results) return;
    const deadBots = results.results.filter((b) => !b.alive).map((b) => b.id);
    if (deadBots.length === 0) {
      onToast?.('No dead bots to clean', 'info');
      return;
    }
    setCleaning(true);
    try {
      const data = await ec2Post('/bots/clean-dead', { bot_ids: deadBots });
      onToast?.(`Cleaned ${data.cleaned || deadBots.length} dead bots`, 'success');
      setResults(null);
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setCleaning(false);
    }
  };

  const deadCount = results?.results?.filter((b) => !b.alive).length || 0;

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            💀 Dead Bot Checker
          </h3>
          <p className="text-xs text-gray-500 mt-1">Check all hosted bots for connectivity</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="px-4 py-2 text-sm font-medium bg-telegram/10 text-telegram border border-telegram/30 rounded-lg hover:bg-telegram/20 transition-colors disabled:opacity-50"
          >
            {checking ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-telegram border-t-transparent rounded-full animate-spin" />
                Checking...
              </span>
            ) : (
              '🔍 Check All'
            )}
          </button>
          {deadCount > 0 && (
            <button
              onClick={handleClean}
              disabled={cleaning}
              className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {cleaning ? 'Cleaning...' : `🧹 Clean ${deadCount} Dead`}
            </button>
          )}
        </div>
      </div>

      {results && (
        <div className="animate-fade-in">
          {/* Summary */}
          {results.summary && (
            <div className="flex gap-4 mb-4 text-sm">
              <span className="text-gray-400">Total: <span className="text-white font-medium">{results.summary.total}</span></span>
              <span className="text-green-400">Alive: <span className="font-medium">{results.summary.alive}</span></span>
              <span className="text-red-400">Dead: <span className="font-medium">{results.summary.dead}</span></span>
            </div>
          )}

          {/* Results list */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {results.results?.map((bot) => (
              <div
                key={bot.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  bot.alive ? 'bg-green-500/5' : 'bg-red-500/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={bot.alive ? 'text-green-400' : 'text-red-400'}>
                    {bot.alive ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-300">@{bot.username || bot.id?.slice(0, 8)}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {bot.error || (bot.alive ? 'OK' : 'Dead')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
