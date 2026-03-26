'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/discovery/SearchBar';
import { jobsApi } from '@/lib/api/jobs.api';
import { categoriesApi } from '@/lib/api/categories.api';
import { Job, CategoryWithCount } from '@/types/job';
import { JobCard } from '@/components/jobs/JobCard';

export default function HomePage() {
  const router = useRouter();
  const [trendingJobs, setTrendingJobs] = useState<Job[]>([]);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      jobsApi.searchPublic({ sort: 'trending', limit: 3 }),
      jobsApi.searchPublic({ sort: 'newest', limit: 3 }),
      categoriesApi.list()
    ]).then(([trending, latest, cats]) => {
      setTrendingJobs(trending.jobs);
      setLatestJobs(latest.jobs);
      setCategories(cats);
      setLoading(false);
    }).catch(err => {
      console.error('Home Page Data fetch error', err);
      setLoading(false);
    });
  }, []);

  const handleSearch = (keyword: string) => {
    if (keyword.trim()) {
      router.push(`/jobs?keyword=${encodeURIComponent(keyword)}`);
    } else {
      router.push('/jobs');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            Khám phá 
            <span className="text-indigo-600 dark:text-indigo-400"> Cơ Hội IT </span>
            Hàng Đầu
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 mb-10">
            Nền tảng việc làm freelance, gig jobs chất lượng nhất Việt Nam.
          </p>
          
          <SearchBar onSearch={handleSearch} className="mb-6 shadow-xl" />
          
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tìm phổ biến:</span>
            {['React', 'Next.js', 'Figma', 'NodeJS'].map(tag => (
              <button key={tag} onClick={() => handleSearch(tag)} className="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-full hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      ) : (
        <>
          {/* Trending Jobs */}
          {trendingJobs.length > 0 && (
            <section className="py-16 px-4 max-w-7xl mx-auto w-full">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Nổi Bật Nhất 🔥</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Đang được nhiều người quan tâm</p>
                </div>
                <Link href="/jobs?sort=trending" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium hidden sm:block">Xem tất cả &rarr;</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            </section>
          )}

          {/* Categories Grid */}
          <section className="bg-gray-50 dark:bg-gray-900/50 py-16 px-4 w-full">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">Khám Phá Theo Lĩnh Vực</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(cat => (
                  <Link href={`/categories/${cat.slug}`} key={cat.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all text-center group">
                    <div className="text-indigo-600 text-3xl mb-3">{cat.icon || '🚀'}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{cat.jobCount} việc làm</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Newest Jobs */}
          {latestJobs.length > 0 && (
            <section className="py-16 px-4 max-w-7xl mx-auto w-full">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Việc Mới Đăng ⚡</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Truy cập cơ hội làm việc mới nhất</p>
                </div>
                <Link href="/jobs?sort=newest" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium hidden sm:block">Xem tất cả &rarr;</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="bg-indigo-600 py-16 px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Bạn là nhà tuyển dụng?</h2>
              <p className="text-indigo-100 mb-8 text-lg">Đăng tuyển dụng nhanh chóng và tiếp cận hàng nghìn chuyên gia.</p>
              <div className="flex justify-center gap-4">
                <Link href="/my-jobs/create" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                  Đăng Việc Miễn Phí
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
