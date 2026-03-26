'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { categoriesApi } from '@/lib/api/categories.api';
import { jobsApi } from '@/lib/api/jobs.api';
import { CategoryWithCount, PaginatedResult, Job } from '@/types/job';
import { JobCard } from '@/components/jobs/JobCard';
import { Pagination } from '@/components/shared/Pagination';

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [category, setCategory] = useState<CategoryWithCount | null>(null);
  const [data, setData] = useState<PaginatedResult<Job> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      categoriesApi.getBySlug(slug),
      jobsApi.searchPublic({ categorySlug: slug, page, limit: 12, sort: 'newest' })
    ]).then(([cat, jobsData]) => {
      setCategory(cat);
      setData(jobsData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [slug, page]);

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (!category) return <div className="py-20 text-center justify-center text-lgtext-gray-500">Không tìm thấy danh mục này.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-3xl p-10 mb-12 shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-10">
          <div className="text-[300px] leading-none">{category.icon || '🚀'}</div>
        </div>
        <div className="relative z-10">
          <div className="text-6xl mb-6">{category.icon || '📁'}</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">{category.name}</h1>
          <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            {category.description || `Khám phá các cơ hội phát triển nghề nghiệp hàng đầu dành riêng cho chuyên gia ${category.name}.`}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <span className="bg-white text-indigo-700 px-6 py-2.5 rounded-full text-sm font-bold shadow-sm">
              {category.jobCount} việc làm mở tuyển 
            </span>
            <button 
               onClick={() => router.push(`/jobs?categorySlug=${slug}`)}
               className="bg-indigo-900/50 hover:bg-indigo-900 px-6 py-2.5 rounded-full text-white text-sm font-bold transition-all border border-indigo-400/30 hover:border-indigo-400 shadow-sm"
            >
              Lọc kết quả chi tiết &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cơ hội mới đăng</h2>
        </div>
        
        {data?.jobs.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.jobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
            <div className="mt-10 mb-8 border-t border-gray-100 dark:border-gray-800 pt-8">
              <Pagination 
                currentPage={data.pagination.page} 
                totalPages={data.pagination.totalPages} 
                onPageChange={(p) => {
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                  setPage(p);
                }} 
              />
            </div>
          </>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chưa có công việc nào</h3>
            <p className="text-gray-500 mt-2">Hiện tại danh mục này chưa có bất kỳ bài đăng tuyển dụng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
