'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const widgetRef = useRef(null);

  // Check if already logged in
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
      .catch(() => setLoading(false));
  }, [router]);

  // Mount Telegram Login Widget
  useEffect(() => {
    if (loading) return;

    // Expose the callback globally
    window.onTelegramAuth = async (authData) => {
      setError('');
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(authData),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Login failed');
          return;
        }
        if (data.user.role === 'owner') router.push('/admin');
        else router.push('/dashboard');
      } catch (e) {
        setError('Login failed: ' + e.message);
      }
    };

    // Load the Telegram widget script
    if (widgetRef.current && !widgetRef.current.hasChildNodes()) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', getBotUsername());
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '8');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      widgetRef.current.appendChild(script);
    }
  }, [loading, router]);

  function getBotUsername() {
    return process.env.NEXT_PUBLIC_BOT_USERNAME || 'your_bot';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-telegram border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
      {/* Glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-telegram/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg">
        {/* Logo / Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-telegram to-telegram-dark flex items-center justify-center text-4xl shadow-lg shadow-telegram/20">
            🤖
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">
          HOST <span className="text-telegram">POMPOM</span>
        </h1>
        <p className="text-gray-400 text-lg mb-2">Bot Hosting Panel</p>
        <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto">
          Manage your hosted Telegram bots. Monitor status, view stats, and control your bots from one place.
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-10 text-sm">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-gray-300 font-medium">Fast Deploy</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-gray-300 font-medium">Live Stats</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl mb-2">🛡️</div>
            <div className="text-gray-300 font-medium">24/7 Uptime</div>
          </div>
        </div>

        {/* Telegram Login Widget */}
        <div className="flex flex-col items-center gap-4">
          <div ref={widgetRef} id="telegram-login-widget" className="flex justify-center" />

          {/* Fallback manual input for testing or if widget fails */}
          <p className="text-gray-600 text-xs mt-4">
            Sign in with your Telegram account to continue
          </p>
        </div>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm animate-fade-in">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-gray-600 text-xs">
        Powered by HOST POMPOM • Secure Telegram Login
      </div>
    </div>
  );
}
