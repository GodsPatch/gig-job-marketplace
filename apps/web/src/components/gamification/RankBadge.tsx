import React from 'react';

export const RankBadge: React.FC<{ rank: number | null }> = ({ rank }) => {
  if (!rank) return <span className="text-sm text-gray-400 font-medium">Unranked</span>;

  let emoji = '';
  let color = 'text-gray-700 bg-gray-100';

  if (rank === 1) { emoji = '🥇'; color = 'text-yellow-800 bg-yellow-100 border-yellow-300 border'; }
  else if (rank === 2) { emoji = '🥈'; color = 'text-gray-800 bg-gray-200 border-gray-300 border'; }
  else if (rank === 3) { emoji = '🥉'; color = 'text-orange-800 bg-orange-100 border-orange-300 border'; }
  else if (rank <= 10) { emoji = '⭐'; color = 'text-blue-800 bg-blue-100 border-blue-200 border'; }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-sm shadow-sm ${color}`}>
      {emoji} Top {rank}
    </span>
  );
};
