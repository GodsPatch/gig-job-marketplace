'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { gamificationApi } from '../../api/gamification';

/**
 * Navbar — auth-aware navigation bar.
 * Shows different links based on authentication state.
 * Includes gamification links and points badge (M6).
 */
export function Navbar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [totalPoints, setTotalPoints] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      gamificationApi.getProgress()
        .then(data => setTotalPoints(data.points.total))
        .catch(() => setTotalPoints(null));
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-indigo-600">
              Gig Marketplace
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/jobs"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium"
                >
                  Tìm việc
                </Link>
                <Link
                  href="/workers"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium"
                >
                  Tìm Freelancer
                </Link>
                {['employer', 'admin'].includes(user?.role as string) && (
                  <>
                    <Link
                      href="/my-jobs"
                      className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium"
                    >
                      Quản lý Jobs
                    </Link>
                    <Link
                      href="/my-jobs/create"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                      Đăng việc
                    </Link>
                  </>
                )}
                {user?.role === 'worker' && (
                  <Link
                    href="/workers/profile"
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium"
                  >
                    Hồ sơ Worker
                  </Link>
                )}
                <Link
                  href="/progress"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium"
                >
                  🎮 Tiến độ
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium"
                >
                  🏆 Xếp hạng
                </Link>
                {totalPoints !== null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                    ⭐ {totalPoints.toLocaleString()}
                  </span>
                )}
                <Link
                  href="/profile"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium"
                >
                  {user?.fullName || 'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/jobs"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium"
                >
                  Tìm việc
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium"
                >
                  🏆 Xếp hạng
                </Link>
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
