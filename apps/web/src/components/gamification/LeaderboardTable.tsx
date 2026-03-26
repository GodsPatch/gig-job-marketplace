import React from 'react';
import { LeaderboardEntry } from '../../types/gamification';

interface LeaderboardTableProps {
  rankings: LeaderboardEntry[];
  currentUserRank?: number | null;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ rankings, currentUserRank }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4 w-16 text-center">Rank</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rankings.map((entry) => {
              const isCurrentUser = currentUserRank === entry.rank;
              return (
                <tr key={entry.user.id} className={`${isCurrentUser ? 'bg-blue-50/50' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 font-bold text-center">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex-shrink-0">
                        {entry.user.avatarUrl ? (
                          <img src={entry.user.avatarUrl} alt={entry.user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold uppercase text-xs">
                            {entry.user.fullName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{entry.user.fullName} {isCurrentUser && <span className="text-xs text-blue-600 ml-1">(You)</span>}</div>
                        <div className="text-xs text-gray-500 capitalize">{entry.user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    {entry.points.toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {rankings.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No participants yet in this cycle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
