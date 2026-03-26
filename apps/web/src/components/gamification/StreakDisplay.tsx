import React from 'react';

export const StreakDisplay: React.FC<{ streak: number }> = ({ streak }) => {
  if (streak < 3) return null; // Only show if reasonable streak

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-full shadow-sm" title={`${streak} Day Login Streak`}>
      <span className="text-lg animate-pulse block">🔥</span>
      <span className="font-bold text-orange-700 text-sm">{streak} Days</span>
    </div>
  );
};
