'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '../../../components/auth/RouteGuard';
import { JobForm } from '../../../components/jobs/JobForm';
import { jobsApi } from '../../../lib/api/jobs.api';
import { CreateJobInput } from '../../../types/job';

export default function CreateJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const job = await jobsApi.create(data as CreateJobInput);
      router.push(`/jobs/${job.slug}`);
    } catch (error) {
      setIsSubmitting(false);
      throw error; // Let the form component catch and displays the error
    }
  };

  return (
    <RouteGuard allowedRoles={['employer', 'admin']}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="mt-2 text-sm text-gray-600">Fill out the details below to create a draft job posting.</p>
        </div>
        
        <JobForm 
          onSubmit={handleSubmit} 
          isLoading={isSubmitting} 
        />
      </div>
    </RouteGuard>
  );
}
