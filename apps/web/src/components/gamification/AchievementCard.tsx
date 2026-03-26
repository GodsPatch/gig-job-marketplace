import React from 'react';
import { AchievementProgress } from '../../types/gamification';

export const AchievementCard: React.FC<{ achievement: AchievementProgress }> = ({ achievement }) => {
  const isUnlocked = !!achievement.unlockedAt;
  const progressPercent = Math.min(
    100,
    achievement.progress ? (achievement.progress.current / achievement.progress.target) * 100 : (isUnlocked ? 100 : 0)
  );

  const tierColors = {
    bronze: 'bg-orange-100 text-orange-800 border-orange-200',
    silver: 'bg-gray-100 text-gray-800 border-gray-200',
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  return (
    <div className={`relative p-5 rounded-xl border ${isUnlocked ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-75'} flex flex-col h-full transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl" aria-hidden="true">{achievement.icon}</div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border uppercase tracking-wider ${tierColors[achievement.tier]}`}>
          {achievement.tier}
        </span>
      </div>
      
      <h3 className={`font-bold mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>{achievement.name}</h3>
      <p className="text-sm text-gray-500 mb-4 flex-grow">{achievement.description}</p>
      
      <div className="mt-auto">
        <div className="flex justify-between text-xs font-medium mb-1">
          <span className={isUnlocked ? 'text-green-600' : 'text-gray-500'}>
            {isUnlocked ? 'Unlocked!' : 'In Progress'}
          </span>
          {achievement.progress && !isUnlocked && (
            <span className="text-gray-500">{achievement.progress.current} / {achievement.progress.target}</span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${isUnlocked ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
