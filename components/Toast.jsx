'use client';

import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-telegram/10 border-telegram/30 text-telegram',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-sm border rounded-xl px-4 py-3 shadow-2xl transition-all duration-300 ${
        colors[type] || colors.info
      } ${visible ? 'animate-slide-in' : 'opacity-0 translate-x-full'}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{icons[type]}</span>
        <p className="text-sm flex-1">{message}</p>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="text-gray-500 hover:text-white flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Toast container hook
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ marginTop: index > 0 ? '0.5rem' : 0 }}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );

  return { addToast, ToastContainer };
}
