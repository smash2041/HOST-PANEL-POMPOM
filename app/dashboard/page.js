'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, ec2Get, ec2Post } from '@/lib/api';
import Navbar from '@/components/Navbar';
import BotCard from '@/components/BotCard';
import HostBotModal from '@/components/HostBotModal';
import { useToast } from '@/components/Toast';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bots, setBots] = useState([]);
  const [botStats, setBotStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showHostModal, setShowHostModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await getMe();
      if (!me) {
        router.push('/');
        return;
      }
      setUser(me);

      // Get all bots (for customers, the proxy/EC2 will filter by their ID)
      const data = await ec2Get('/bots');
      const allBots = data.bots || [];

      // For non-owner, filter to own bots
      const myBots = me.role === 'owner'
        ? allBots
        : allBots.filter((b) => String(b.owner_user_id) === String(me.id));
      setBots(myBots);
      setLoading(false);

      // Fetch stats for each bot in background (non-blocking)
      Promise.all(
        myBots.slice(0, 10).map(async (bot) => {
          try {
            const stats = await ec2Get(`/bots/${bot.id}/stats`);
            setBotStats((prev) => ({ ...prev, [bot.id]: stats }));
          } catch {}
        })
      );
    } catch (err) {
      addToast('Failed to load data: ' + err.message, 'error');
      setLoading(false);
    }
  };

  const handleBotAction = async (action, botId) => {
    if (action === 'stats') {
      // Show stats inline — already loaded
      addToast(
        botStats[botId]
          ? `Users: ${botStats[botId].total_users || 0}, Orders: ${botStats[botId].total_orders || 0}`
          : 'No stats available',
        'info'
      );
      return;
    }

    if (action === 'delete') {
      if (!confirm('Are you sure you want to delete this bot? This cannot be undone.')) return;
    }

    setActionLoading(botId);
    try {
      await ec2Post(`/bots/${botId}/${action}`);
      addToast(`Bot ${action}${action.endsWith('e') ? 'd' : 'ed'} successfully!`, 'success');
      await loadData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-telegram border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar user={user} />
      <ToastContainer />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">👋 Welcome, {user?.first_name}</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your hosted Telegram bots</p>
          </div>
          <button
            onClick={() => setShowHostModal(true)}
            className="px-5 py-2.5 bg-telegram text-white rounded-xl hover:bg-telegram-dark transition-colors text-sm font-medium flex items-center gap-2"
          >
            ➕ Host New Bot
          </button>
        </div>

        {/* Quick Stats */}
        {bots.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">My Bots</p>
              <p className="text-2xl font-bold text-white">{bots.length}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Active</p>
              <p className="text-2xl font-bold text-green-400">
                {bots.filter((b) => b.status === 'active').length}
              </p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Stopped</p>
              <p className="text-2xl font-bold text-red-400">
                {bots.filter((b) => b.status === 'stopped').length}
              </p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Total Users</p>
              <p className="text-2xl font-bold text-telegram">
                {Object.values(botStats).reduce((sum, s) => sum + (s?.total_users || 0), 0)}
              </p>
            </div>
          </div>
        )}

        {/* Bots Grid */}
        {bots.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No Bots Yet</h2>
            <p className="text-gray-500 mb-6">Host your first Telegram bot to get started</p>
            <button
              onClick={() => setShowHostModal(true)}
              className="px-6 py-3 bg-telegram text-white rounded-xl hover:bg-telegram-dark transition-colors font-medium"
            >
              🚀 Host Your First Bot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bots.map((bot) => (
              <div key={bot.id} className="relative">
                {actionLoading === bot.id && (
                  <div className="absolute inset-0 bg-gray-900/80 rounded-xl flex items-center justify-center z-10">
                    <div className="w-6 h-6 border-2 border-telegram border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <BotCard bot={bot} onAction={handleBotAction} />

                {/* Bot Stats */}
                {botStats[bot.id] && (
                  <div className="mt-2 bg-gray-900/40 border border-gray-800/50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-gray-500">Users</p>
                      <p className="text-white font-medium">{botStats[bot.id].total_users || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Orders</p>
                      <p className="text-white font-medium">{botStats[bot.id].total_orders || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Approved</p>
                      <p className="text-green-400 font-medium">{botStats[bot.id].approved_orders || 0}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showHostModal && (
        <HostBotModal
          onClose={() => setShowHostModal(false)}
          onSuccess={() => loadData()}
          onToast={addToast}
          userId={user?.id}
          isOwner={user?.role === 'owner'}
        />
      )}
    </div>
  );
}
