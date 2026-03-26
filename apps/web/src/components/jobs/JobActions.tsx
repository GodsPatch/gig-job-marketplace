'use client';

import React, { useState } from 'react';
import { jobsApi } from '../../lib/api/jobs.api';
import { Job } from '../../types/job';
import { useRouter } from 'next/navigation';

interface JobActionsProps {
  job: Job;
  onUpdate: (updatedJob: Job) => void;
}

export function JobActions({ job, onUpdate }: JobActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this job? Once published, it will be visible to everyone.')) return;
    setLoading(true);
    try {
      const updated = await jobsApi.publish(job.id);
      onUpdate(updated);
    } catch (err) {
      alert('Failed to publish job. Please ensure all required fields are filled.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('Are you sure you want to close this job? You cannot reopen it.')) return;
    setLoading(true);
    try {
      const updated = await jobsApi.close(job.id);
      onUpdate(updated);
    } catch (err) {
      alert('Failed to close job.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/my-jobs/${job.id}/edit`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {job.status === 'draft' && (
        <>
          <button
            onClick={handleEdit}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Edit
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Publish Job
          </button>
        </>
      )}

      {job.status === 'published' && (
        <button
          onClick={handleClose}
          disabled={loading}
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
        >
          Close Job
        </button>
      )}

      {job.status === 'closed' && (
        <span className="text-sm text-gray-500 italic">This job is closed and cannot be modified.</span>
      )}
    </div>
  );
}
