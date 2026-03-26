'use client';

import React, { useEffect, useState } from 'react';

interface AchievementToastProps {
  name: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
  onClose: () => void;
  duration?: number;
}

const tierStyles = {
  bronze: 'from-orange-500 to-amber-600 shadow-orange-200/60',
  silver: 'from-gray-400 to-slate-500 shadow-gray-300/60',
  gold: 'from-yellow-400 to-amber-500 shadow-yellow-200/60',
};

export const AchievementToast: React.FC<AchievementToastProps> = ({
  name,
  icon,
  tier,
  onClose,
  duration = 4000,
}) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 400);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 transition-all duration-500 ease-out ${
        visible && !exiting
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div
        className={`flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r ${tierStyles[tier]} text-white shadow-2xl min-w-[300px] backdrop-blur-sm`}
      >
        <div className="text-4xl animate-bounce">{icon}</div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Achievement Unlocked!
          </p>
          <p className="text-lg font-bold mt-0.5">{name}</p>
        </div>
        <button
          onClick={() => {
            setExiting(true);
            setTimeout(onClose, 400);
          }}
          className="text-white/60 hover:text-white transition-colors text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};
