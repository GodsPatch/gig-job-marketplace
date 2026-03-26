import React, { useEffect, useState } from 'react';
import { PointTransaction } from '../../types/gamification';
import { gamificationApi } from '../../api/gamification';

export const PointHistory: React.FC = () => {
  const [history, setHistory] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    gamificationApi.getPointHistory({ page: 1, limit: 10 }).then(res => {
      setHistory(res.transactions);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <div className="p-4 text-center text-gray-500 text-sm">Loading history...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Recent Points History</h2>
      </div>
      
      {history.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No point transactions yet.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {history.map(tx => (
            <li key={tx.id} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900 capitalize">{tx.actionCode.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
              </div>
              <div className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                +{tx.points} pts
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
