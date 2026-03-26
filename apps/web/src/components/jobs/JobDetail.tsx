import React from 'react';
import { Job } from '../../types/job';
import { BudgetDisplay } from './BudgetDisplay';
import { JobStatusBadge } from './JobStatusBadge';
import { JobActions } from './JobActions';

interface JobDetailProps {
  job: Job;
  isOwner?: boolean;
  onJobUpdate?: (job: Job) => void;
}

export function JobDetail({ job, isOwner = false, onJobUpdate }: JobDetailProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
          <div className="flex flex-col items-end">
            <BudgetDisplay 
              type={job.budgetType} 
              min={job.budgetMin} 
              max={job.budgetMax} 
              className="text-2xl text-green-600 font-bold mb-2"
            />
            {isOwner && <JobStatusBadge status={job.status} />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-semibold w-24">Category:</span>
            <span>{job.category.name}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-24">Location:</span>
            <span className="capitalize">{job.locationType === 'remote' ? 'Remote' : job.location}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-24">Posted:</span>
            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-24">Employer:</span>
            <span>{job.createdBy.fullName}</span>
          </div>
        </div>

        <div className="prose max-w-none mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {job.description}
          </div>
        </div>

        {isOwner && onJobUpdate && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Manage Job</h3>
            <JobActions job={job} onUpdate={onJobUpdate} />
          </div>
        )}
      </div>
    </div>
  );
}
