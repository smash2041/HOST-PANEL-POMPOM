'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check in background if already logged in
  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error();
      })
      .then((user) => {
        if (user.role === 'owner') router.push('/admin');
        else router.push('/dashboard');
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setSubmitting(false);
        return;
      }

      if (data.user.role === 'owner') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
      {/* Glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-telegram/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-telegram to-telegram-dark text-3xl shadow-lg shadow-telegram/20">
            🤖
          </div>
          <h1 className="text-3xl font-bold mb-1 text-white">
            HOST <span className="text-telegram">POMPOM</span>
          </h1>
          <p className="text-gray-400 text-sm">Bot Hosting Control Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-2">Sign In to Dashboard</h2>
          <p className="text-xs text-gray-500 mb-6">Enter your account credentials provided by the admin.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-telegram transition-colors text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-telegram transition-colors text-sm"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs animate-fade-in flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 px-5 py-3.5 bg-telegram hover:bg-telegram-dark text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-telegram/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In 🚀</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Need access or forgot password? Contact the Owner on Telegram.
        </p>
      </div>
    </div>
  );
}
