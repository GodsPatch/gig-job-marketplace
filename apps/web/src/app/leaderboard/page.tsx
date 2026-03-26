"use client";

import { useEffect, useState } from 'react';
import { gamificationApi } from '../../api/gamification';
import { LeaderboardData } from '../../types/gamification';
import { LeaderboardTable } from '../../components/gamification/LeaderboardTable';

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [cycle, setCycle] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    gamificationApi.getLeaderboard(cycle)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [cycle]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-5 mb-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 tracking-tight">
          Top Performers
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          See who is leading the pack, completing jobs, and unlocking achievements in the Gig Marketplace.
        </p>
        
        <div className="inline-flex items-center bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-xl border border-gray-200 shadow-inner">
          <button 
            onClick={() => setCycle('weekly')}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${cycle === 'weekly' ? 'bg-white shadow-md text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Weekly Leaders
          </button>
          <button 
            onClick={() => setCycle('monthly')}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${cycle === 'monthly' ? 'bg-white shadow-md text-purple-700' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Monthly Leaders
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ) : data ? (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 capitalize">{cycle} Rankings</h2>
              <p className="text-sm text-gray-500">Based on points earned since the start of the {cycle}.</p>
            </div>
            <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
              {data.totalParticipants} Participants
            </div>
          </div>
          <LeaderboardTable rankings={data.rankings} currentUserRank={data.currentUser?.rank} />
        </div>
      ) : (
        <div className="p-12 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100">
          <p className="font-semibold text-lg">Failed to load leaderboard data.</p>
          <p className="text-sm mt-2 opacity-80">Please try again later.</p>
        </div>
      )}
    </div>
  );
}
