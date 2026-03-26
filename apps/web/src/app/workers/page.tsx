'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WorkerCard } from '@/components/worker/WorkerCard';
import { WorkerFilterSidebar } from '@/components/worker/WorkerFilterSidebar';
import { workersApi } from '@/lib/api/workers.api';
import { WorkerCardData, WorkerListFilters, Pagination } from '@/types/marketplace';

export default function WorkersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [workers, setWorkers] = useState<WorkerCardData[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');

  const getFilters = useCallback((): WorkerListFilters => ({
    keyword: searchParams.get('keyword') || undefined,
    skillIds: searchParams.get('skillIds') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    availability: (searchParams.get('availability') as any) || undefined,
    hourlyRateMin: searchParams.get('hourlyRateMin') ? Number(searchParams.get('hourlyRateMin')) : undefined,
    hourlyRateMax: searchParams.get('hourlyRateMax') ? Number(searchParams.get('hourlyRateMax')) : undefined,
    ratingMin: searchParams.get('ratingMin') ? Number(searchParams.get('ratingMin')) : undefined,
    experienceMin: searchParams.get('experienceMin') ? Number(searchParams.get('experienceMin')) : undefined,
    sort: searchParams.get('sort') || 'rating_desc',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 12,
  }), [searchParams]);

  const updateFilters = useCallback((updates: Partial<WorkerListFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
      else params.delete(key);
    });
    router.push(`/workers?${params.toString()}`);
  }, [searchParams, router]);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const result = await workersApi.search(getFilters());
        setWorkers(result.workers);
        setPagination(result.pagination);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchWorkers();
  }, [searchParams, getFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ keyword: keyword || undefined, page: 1 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tìm Worker</h1>
        <p className="text-gray-600">Tìm kiếm chuyên gia phù hợp với dự án của bạn</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tìm theo tên, chức danh..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500" />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">Tìm kiếm</button>
        </div>
      </form>

      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-xl p-5">
            <WorkerFilterSidebar filters={getFilters()} onChange={updateFilters} />
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">{pagination.total} kết quả</p>
            <select value={getFilters().sort} onChange={e => updateFilters({ sort: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
              <option value="rating_desc">Rating cao nhất</option>
              <option value="experience_desc">Kinh nghiệm cao nhất</option>
              <option value="hourly_rate_asc">Giá thấp nhất</option>
              <option value="hourly_rate_desc">Giá cao nhất</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">Không tìm thấy worker phù hợp</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {workers.map(w => <WorkerCard key={w.id} worker={w} />)}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => updateFilters({ page: p })}
                  className={`px-3 py-1.5 rounded-lg text-sm ${p === pagination.page ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
