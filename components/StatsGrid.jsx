'use client';

export default function StatsGrid({ stats }) {
  const items = [
    { label: 'Total Bots', value: stats?.total_bots ?? 0, icon: '🤖', color: 'text-telegram' },
    { label: 'Active', value: stats?.active_bots ?? 0, icon: '🟢', color: 'text-green-400' },
    { label: 'Stopped', value: stats?.stopped_bots ?? 0, icon: '🔴', color: 'text-red-400' },
    { label: 'Expired', value: stats?.expired_bots ?? 0, icon: '🟡', color: 'text-yellow-400' },
    { label: 'Admins', value: stats?.total_admins ?? 0, icon: '👥', color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</span>
          </div>
          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
