'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, ec2Get, ec2Post } from '@/lib/api';
import Navbar from '@/components/Navbar';
import BotCard from '@/components/BotCard';
import StatsGrid from '@/components/StatsGrid';
import AdminTable from '@/components/AdminTable';
import DeadBotChecker from '@/components/DeadBotChecker';
import HostBotModal from '@/components/HostBotModal';
import AddAdminModal from '@/components/AddAdminModal';
import { useToast } from '@/components/Toast';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bots, setBots] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bots');
  const [showHostModal, setShowHostModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { addToast, ToastContainer } = useToast();

  const loadData = useCallback(async () => {
    try {
      const me = await getMe();
      if (!me || me.role !== 'owner') {
        router.push(me ? '/dashboard' : '/');
        return;
      }
      setUser(me);

      const [botsData, adminsData, statsData] = await Promise.all([
        ec2Get('/bots').catch(() => ({ bots: [] })),
        ec2Get('/admins').catch(() => ({ admins: [] })),
        ec2Get('/stats').catch(() => null),
      ]);

      setBots(botsData.bots || []);
      setAdmins(adminsData.admins || []);
      setStats(statsData);
    } catch (err) {
      addToast('Failed to load data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [router, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBotAction = async (action, botId) => {
    if (action === 'stats') {
      try {
        const data = await ec2Get(`/bots/${botId}/stats`);
        const lines = [
          `📊 Bot Stats`,
          `Users: ${data.total_users || 0}`,
          `Orders: ${data.total_orders || 0}`,
          `Approved: ${data.approved_orders || 0}`,
        ];
        addToast(lines.join(' | '), 'info');
      } catch {
        addToast('Failed to load stats', 'error');
      }
      return;
    }

    if (action === 'delete') {
      if (!confirm('Delete this bot permanently?')) return;
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

  const handleRemoveAdmin = async (userId) => {
    try {
      await ec2Post(`/admins/${userId}/remove`);
      addToast('Admin removed', 'success');
      await loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Filter bots
  const filteredBots = bots.filter((bot) => {
    const matchesSearch =
      !searchQuery ||
      bot.bot_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(bot.owner_user_id).includes(searchQuery) ||
      bot.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-telegram border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'bots', label: '🤖 Bots', count: bots.length },
    { id: 'admins', label: '👥 Admins', count: admins.length },
    { id: 'health', label: '💀 Health Check' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar user={user} />
      <ToastContainer />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">👑 Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all hosted bots and admins</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="mb-8">
            <StatsGrid stats={stats} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-gray-900/60 border border-gray-800 rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-800 text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'bots' && (
          <div className="animate-fade-in">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username, owner ID, or bot ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-telegram text-sm"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-telegram [color-scheme:dark]"
              >
                <option value="all">All Status</option>
                <option value="active">🟢 Active</option>
                <option value="stopped">🔴 Stopped</option>
                <option value="expired">🟡 Expired</option>
                <option value="deleted">⚫ Deleted</option>
              </select>
              <button
                onClick={() => setShowHostModal(true)}
                className="px-5 py-2.5 bg-telegram text-white rounded-xl hover:bg-telegram-dark transition-colors text-sm font-medium whitespace-nowrap"
              >
                ➕ Host Bot
              </button>
            </div>

            {/* Bots Grid */}
            {filteredBots.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-5xl mb-3">📭</div>
                <p>{searchQuery || statusFilter !== 'all' ? 'No bots match your filters' : 'No bots hosted yet'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBots.map((bot) => (
                  <div key={bot.id} className="relative">
                    {actionLoading === bot.id && (
                      <div className="absolute inset-0 bg-gray-900/80 rounded-xl flex items-center justify-center z-10">
                        <div className="w-6 h-6 border-2 border-telegram border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <BotCard bot={bot} onAction={handleBotAction} isOwner={true} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-xs text-gray-600 text-right">
              Showing {filteredBots.length} of {bots.length} bots
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Hosting Admins</h2>
              <button
                onClick={() => setShowAdminModal(true)}
                className="px-5 py-2.5 bg-telegram text-white rounded-xl hover:bg-telegram-dark transition-colors text-sm font-medium"
              >
                ➕ Add Admin
              </button>
            </div>
            <AdminTable admins={admins} onRemove={handleRemoveAdmin} />
          </div>
        )}

        {activeTab === 'health' && (
          <div className="animate-fade-in">
            <DeadBotChecker onToast={addToast} />
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
          isOwner={true}
        />
      )}
      {showAdminModal && (
        <AddAdminModal
          onClose={() => setShowAdminModal(false)}
          onSuccess={() => loadData()}
          onToast={addToast}
        />
      )}
    </div>
  );
}
