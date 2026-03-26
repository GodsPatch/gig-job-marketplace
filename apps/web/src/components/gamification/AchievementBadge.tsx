import React from 'react';

interface AchievementBadgeProps {
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
  name: string;
  size?: 'sm' | 'md';
}

const tierBg = {
  bronze: 'bg-orange-100 border-orange-300 ring-orange-200',
  silver: 'bg-gray-100 border-gray-300 ring-gray-200',
  gold: 'bg-yellow-100 border-yellow-300 ring-yellow-200',
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon,
  tier,
  name,
  size = 'sm',
}) => {
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-base' : 'w-10 h-10 text-lg';

  return (
    <div
      title={name}
      className={`inline-flex items-center justify-center rounded-full border ring-1 shadow-sm ${tierBg[tier]} ${sizeClasses} transition-transform hover:scale-110 cursor-default`}
    >
      {icon}
    </div>
  );
};
