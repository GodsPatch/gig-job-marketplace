import React from 'react';
import { AchievementProgress } from '../../types/gamification';
import { AchievementCard } from './AchievementCard';

interface AchievementGridProps {
  unlocked: AchievementProgress[];
  locked: AchievementProgress[];
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({ unlocked, locked }) => {
  // Combine and sort: unlocked first, then by tier/progress
  const combined = [...unlocked.map(a => ({ ...a, isUnlocked: true })), ...locked.map(a => ({ ...a, isUnlocked: false }))];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
      {unlocked.length === 0 && locked.length === 0 ? (
        <p className="text-gray-500 text-sm">No achievements available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {combined.map(achievement => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
  );
};
