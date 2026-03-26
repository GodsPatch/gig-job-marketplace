'use client';

import { useState } from 'react';
import { StarRating } from './StarRating';
import { reviewsApi } from '@/lib/api/reviews.api';

interface ReviewFormProps {
  jobId: string;
  revieweeId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ jobId, revieweeId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Vui lòng chọn số sao'); return; }
    setLoading(true); setError('');

    try {
      await reviewsApi.create(jobId, { revieweeId, rating, comment: comment || undefined });
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-center">
        ✅ Đánh giá đã được gửi thành công!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Viết đánh giá</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá sao *</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nhận xét (tùy chọn)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Chia sẻ trải nghiệm của bạn..."
        />
        <p className="text-xs text-gray-400 mt-1">{comment.length}/1000</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>
    </form>
  );
}
