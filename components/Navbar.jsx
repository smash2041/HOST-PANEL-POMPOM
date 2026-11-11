'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar({ user }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/me', { method: 'DELETE', credentials: 'include' });
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-telegram to-telegram-dark flex items-center justify-center text-lg">
              🤖
            </div>
            <span className="font-bold text-lg">
              HOST <span className="text-telegram">POMPOM</span>
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center gap-1">
            {user?.role === 'owner' && (
              <>
                <button
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  Admin Panel
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </button>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-telegram flex items-center justify-center text-sm font-bold">
                  {user?.first_name?.[0] || '?'}
                </div>
              )}
              <span className="hidden sm:block text-sm text-gray-300">
                {user?.first_name}
              </span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-1 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-800">
                  <p className="text-sm font-medium">{user?.first_name}</p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'owner' ? '👑 Owner' : '🔑 Admin'}
                  </p>
                </div>
                <div className="sm:hidden">
                  {user?.role === 'owner' && (
                    <>
                      <button
                        onClick={() => { router.push('/admin'); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      >
                        Admin Panel
                      </button>
                      <button
                        onClick={() => { router.push('/dashboard'); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      >
                        Dashboard
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
