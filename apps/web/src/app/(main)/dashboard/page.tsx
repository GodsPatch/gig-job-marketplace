'use client';

import { useAuth } from '@/lib/auth';
import { RouteGuard } from '@/components/auth/RouteGuard';
import Link from 'next/link';

/**
 * Dashboard page — protected route.
 * Shows different content based on user role.
 */
function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Xin chào, {user?.fullName || 'Người dùng'}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Vai trò: <span className="font-medium capitalize">{user?.role}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Email: <span className="font-medium">{user?.email}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/profile" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              👤 Hồ sơ cá nhân
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Xem và cập nhật thông tin cá nhân
            </p>
          </div>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 opacity-60">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            💼 {user?.role === 'employer' ? 'Quản lý công việc' : 'Tìm việc'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            🚧 Coming in M3
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RouteGuard>
      <DashboardContent />
    </RouteGuard>
  );
}
