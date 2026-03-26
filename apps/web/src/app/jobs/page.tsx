'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { useJobSearch } from '@/hooks/useJobSearch';
import { FilterSidebar } from '@/components/discovery/FilterSidebar';
import { SearchBar } from '@/components/discovery/SearchBar';
import { SortSelect } from '@/components/discovery/SortSelect';
import { categoriesApi } from '@/lib/api/categories.api';
import { CategoryWithCount } from '@/types/job';

function JobsListContent() {
  const { filters, updateFilters, clearFilters, loading, data } = useJobSearch();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <SearchBar 
          initialValue={filters.keyword} 
          onSearch={(keyword) => updateFilters({ keyword: keyword || undefined })} 
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4 flex-shrink-0">
          <div className="sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bộ lọc</h2>
              <button 
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium"
              >
                Xóa lọc
              </button>
            </div>
            <FilterSidebar 
              filters={filters} 
              onChange={updateFilters} 
              categories={categories} 
            />
          </div>
        </div>
        
        <div className="w-full lg:w-3/4 flex-grow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {data ? `${data.pagination.total} Việc làm phù hợp` : 'Đang tải...'}
            </h2>
            <div className="w-48">
              <SortSelect 
                value={filters.sort || 'newest'} 
                onChange={(sort) => updateFilters({ sort })} 
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg border border-gray-200 dark:border-gray-700"></div>)}
            </div>
          ) : data?.jobs.length ? (
            <>
              <div className="space-y-4 mb-8">
                {data.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <Pagination 
                currentPage={data.pagination.page} 
                totalPages={data.pagination.totalPages} 
                onPageChange={(p: number) => updateFilters({ page: p })} 
              />
            </>
          ) : (
            <EmptyState 
              title="Không tìm thấy việc làm"
              description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm nhiều kết quả hơn."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Đang tải trang khám phá...</div>}>
        <JobsListContent />
      </Suspense>
    </div>
  );
}
