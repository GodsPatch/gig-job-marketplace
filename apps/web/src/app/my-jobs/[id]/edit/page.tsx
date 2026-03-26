'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RouteGuard } from '../../../../components/auth/RouteGuard';
import { JobForm } from '../../../../components/jobs/JobForm';
import { jobsApi } from '../../../../lib/api/jobs.api';
import { Job, UpdateJobInput } from '../../../../types/job';

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    
    // Instead of getting by slug, we should get by slug or id. 
    // In our backend, we don't have GetById endpoint. We have GetBySlug.
    // Wait, the employer can just use GET /jobs/:slug? 
    // Wait... if we use :id in the route, we need a Get API.
    // Let's assume we can fetch listOwn and find it, or we just call getBySlug!
    // Since the directory is [id], we probably passed the job ID. But wait, `getBySlug` in Backend actually supports Slug...
    // Actually, since I mapped it to /my-jobs/[id]/edit, I might simply fetch listOwn and filter by ID because there's no `findById` public route.
    // Wait! The user might just pass the slug to the URL if we change the route to `[slug]/edit`. 
    // But since the folder is `[id]`, I'll fetch `listOwn()` to find the job instance for this user by ID.
    // This is a quick workaround since M3 didn't prompt for `GET /jobs/id` except `GET /jobs/:slug`.
    
    jobsApi.listOwn({}) // Note: this gets page 1. A real system would need GET /jobs/id
      .then(res => {
        const found = res.jobs.find((j: Job) => j.id === id);
        if (found) {
          setJob(found);
        } else {
          setError('Job not found or you do not have permission to edit it. Make sure it is on the first page of your jobs list.');
        }
      })
      .catch((err: any) => {
        console.error(err);
        setError('Failed to load job details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: UpdateJobInput) => {
    setIsSubmitting(true);
    try {
      const updatedJob = await jobsApi.update(id as string, data as UpdateJobInput);
      router.push(`/jobs/${updatedJob.slug}`);
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-8 animate-pulse"><div className="h-96 bg-gray-200 rounded-xl"></div></div>;

  if (error || !job) {
    return (
      <RouteGuard allowedRoles={['employer', 'admin']}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
        </div>
      </RouteGuard>
    );
  }

  if (job.status !== 'draft') {
    return (
      <RouteGuard allowedRoles={['employer', 'admin']}>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Cannot Edit Job</h2>
          <p className="mt-2 text-gray-600">Only draft jobs can be edited. This job is currently {job.status}.</p>
          <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go Back</button>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['employer', 'admin']}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Job: {job.title}</h1>
        </div>
        
        <JobForm 
          initialData={job}
          onSubmit={handleSubmit} 
          isLoading={isSubmitting} 
        />
      </div>
    </RouteGuard>
  );
}
