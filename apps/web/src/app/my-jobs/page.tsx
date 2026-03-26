'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RouteGuard } from '../../components/auth/RouteGuard';
import { jobsApi } from '../../lib/api/jobs.api';
import { Job, PaginatedResult } from '../../types/job';
import { JobManagementTable } from '../../components/jobs/JobManagementTable';
import { Pagination } from '../../components/shared/Pagination';
import { EmptyState } from '../../components/shared/EmptyState';

export default function MyJobsPage() {
  const [result, setResult] = useState<PaginatedResult<Job> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    jobsApi.listOwn({ page, limit: 10 })
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <RouteGuard allowedRoles={['employer', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
            <p className="mt-2 text-sm text-gray-700">Manage your job postings, track applications, and update details.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/my-jobs/create"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:w-auto"
            >
              Post a New Job
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        ) : result?.jobs.length ? (
          <>
            <JobManagementTable jobs={result.jobs} />
            <Pagination 
              currentPage={result.pagination.page} 
              totalPages={result.pagination.totalPages} 
              onPageChange={setPage} 
            />
          </>
        ) : (
          <EmptyState 
            title="No jobs yet"
            description="You haven't posted any jobs. Get started by creating your first job posting."
            action={
              <Link href="/my-jobs/create" className="text-blue-600 font-medium hover:text-blue-500">
                Post a Job &rarr;
              </Link>
            }
          />
        )}
      </div>
    </RouteGuard>
  );
}
