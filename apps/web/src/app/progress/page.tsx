"use client";

import { useEffect, useState } from 'react';
import { gamificationApi } from '../../api/gamification';
import { ProgressData } from '../../types/gamification';
import { PointsSummary } from '../../components/gamification/PointsSummary';
import { AchievementGrid } from '../../components/gamification/AchievementGrid';
import { PointHistory } from '../../components/gamification/PointHistory';
import { RankBadge } from '../../components/gamification/RankBadge';

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gamificationApi.getProgress()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load gamification data. Make sure you are logged in.');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );

  if (error || !data) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="bg-red-50 text-red-600 p-6 rounded-xl inline-block shadow-sm">
        {error || 'Unknown error occurred'}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Progress</h1>
          <p className="text-gray-500 mt-1">Track your points, rank, and unlocked achievements.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Weekly Rank:</div>
          <RankBadge rank={data.rank.weekly.position} />
        </div>
      </div>
      
      <PointsSummary 
        total={data.points.total} 
        weekly={data.points.weekly} 
        monthly={data.points.monthly} 
        currentStreak={data.streak.current} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AchievementGrid unlocked={data.achievements.unlocked} locked={data.achievements.locked} />
        </div>
        <div className="lg:col-span-1">
          <PointHistory />
        </div>
      </div>
    </div>
  );
}
