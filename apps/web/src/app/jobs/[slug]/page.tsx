'use client';

import React, { useEffect, useState } from 'react';
import { jobsApi } from '@/lib/api/jobs.api';
import { Job } from '@/types/job';
import { JobDetail } from '@/components/jobs/JobDetail';
import { useAuth } from '@/lib/auth';
import { JobReviews } from '@/components/review/JobReviews';
import { useParams } from 'next/navigation';

export default function JobDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    jobsApi.getBySlug(slug as string)
      .then(setJob)
      .catch((err: any) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-4xl mx-auto p-8 animate-pulse"><div className="h-64 bg-gray-200 rounded-xl"></div></div>;
  if (error || !job) return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900">Job Not Found</h2>
      <p className="mt-2 text-gray-600">The job you are looking for does not exist or has been removed.</p>
    </div>
  );

  const isOwner = user?.id === job.createdBy.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JobDetail 
        job={job} 
        isOwner={isOwner} 
        onJobUpdate={setJob} 
      />
      
      <JobReviews 
        jobId={job.id} 
        jobStatus={job.status} 
        isOwner={isOwner} 
        createdByUserId={job.createdBy.id} 
      />
    </div>
  );
}
