'use client';

import { useState, useEffect } from 'react';
import { reviewsApi } from '@/lib/api/reviews.api';
import { useAuth } from '@/lib/auth';
import { JobStatus } from '@/types/job';
import { ReviewWithDetails } from '@/types/marketplace';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';

interface JobReviewsProps {
  jobId: string;
  jobStatus: JobStatus;
  isOwner: boolean;
  createdByUserId: string;
}

export function JobReviews({ jobId, jobStatus, isOwner, createdByUserId }: JobReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const data = await reviewsApi.listByJob(jobId);
      setReviews(data.reviews);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [jobId]);

  if (jobStatus !== 'closed') return null;

  const hasReviewed = reviews.some(r => r.reviewer.id === user?.id);
  const canReview = user && !isOwner && !hasReviewed && user.id !== createdByUserId;

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá cho công việc này</h2>
      
      {canReview && (
        <div className="mb-8">
          <ReviewForm jobId={jobId} revieweeId={createdByUserId} onSuccess={fetchReviews} />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">Chưa có đánh giá nào.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => <ReviewCard key={r.review.id} review={r} />)}
        </div>
      )}
    </div>
  );
}
