import React from 'react';
import Link from 'next/link';
import { Job } from '../../types/job';
import { BudgetDisplay } from './BudgetDisplay';
import { JobStatusBadge } from './JobStatusBadge';

interface JobCardProps {
  job: Job;
  showStatus?: boolean; // True for owner view
}

export function JobCard({ job, showStatus = false }: JobCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link href={`/jobs/${job.slug}`} className="group">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
          </Link>
          <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
            <span className="flex items-center">
              <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {job.category.name}
            </span>
            <span className="flex items-center">
              <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.locationType === 'remote' ? 'Remote' : job.location}
            </span>
            <span className="flex items-center">
              <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <BudgetDisplay 
            type={job.budgetType} 
            min={job.budgetMin} 
            max={job.budgetMax} 
            className="text-lg text-green-600 font-bold"
          />
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {job.description}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
           {showStatus && <JobStatusBadge status={job.status} />}
        </div>
        <Link 
          href={`/jobs/${job.slug}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
