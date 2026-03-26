import React from 'react';

interface PointsSummaryProps {
  total: number;
  weekly: number;
  monthly: number;
  currentStreak: number;
}

export const PointsSummary: React.FC<PointsSummaryProps> = ({ total, weekly, monthly, currentStreak }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Gamification Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Points</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{total.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Weekly Points</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{weekly.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Monthly Points</p>
          <p className="text-3xl font-bold text-purple-900 mt-1">{monthly.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">Login Streak</p>
          <p className="text-3xl font-bold text-orange-900 mt-1">{currentStreak} <span className="text-lg">🔥</span></p>
        </div>
      </div>
    </div>
  );
};
