import { ReviewWithDetails } from '@/types/marketplace';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: ReviewWithDetails;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const timeAgo = getTimeAgo(new Date(review.review.createdAt));
  
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            {review.reviewer.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{review.reviewer.fullName}</p>
            <p className="text-xs text-gray-500 capitalize">{review.reviewer.role}</p>
          </div>
        </div>
        <StarRating value={review.review.rating} readonly size="sm" />
      </div>
      {review.review.comment && (
        <p className="text-gray-700 text-sm mt-2 leading-relaxed">&ldquo;{review.review.comment}&rdquo;</p>
      )}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>Job: {review.job.title}</span>
        <span>{timeAgo}</span>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  return `${months} tháng trước`;
}
