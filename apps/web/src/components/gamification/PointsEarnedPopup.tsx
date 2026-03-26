'use client';

import React, { useEffect, useState } from 'react';

interface PointsEarnedPopupProps {
  points: number;
  actionLabel?: string;
  onClose: () => void;
  duration?: number;
}

export const PointsEarnedPopup: React.FC<PointsEarnedPopupProps> = ({
  points,
  actionLabel,
  onClose,
  duration = 3000,
}) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 500);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        visible && !exiting
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-8 opacity-0 scale-90'
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-200/50">
        <span className="text-xl">🎯</span>
        <span className="font-bold text-lg">+{points}</span>
        <span className="text-sm font-medium opacity-90">
          {actionLabel || 'points earned!'}
        </span>
      </div>
    </div>
  );
};
