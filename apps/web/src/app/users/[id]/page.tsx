'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { profilesApi } from '@/lib/api/profiles.api';
import { reviewsApi } from '@/lib/api/reviews.api';
import { PublicProfile, ReviewWithDetails, ReviewSummary } from '@/types/marketplace';
import { RatingDisplay } from '@/components/review/RatingDisplay';
import { RatingDistribution } from '@/components/review/RatingDistribution';
import { ReviewCard } from '@/components/review/ReviewCard';
import { AvailabilityBadge } from '@/components/worker/AvailabilityBadge';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, reviewsData] = await Promise.all([
          profilesApi.getPublic(userId),
          reviewsApi.listByUser(userId),
        ]);
        setProfile(profileData);
        setReviews(reviewsData.data);
        setSummary(reviewsData.summary);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [userId]);

  if (loading) return <div className="max-w-4xl mx-auto py-16 text-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" /></div>;
  if (!profile) return <div className="max-w-4xl mx-auto py-16 text-center text-gray-500">Không tìm thấy hồ sơ</div>;

  const isWorker = 'workerProfile' in profile;
  const isEmployer = 'employerStats' in profile;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {profile.user.avatarUrl ? (
              <img src={profile.user.avatarUrl} className="w-20 h-20 rounded-full object-cover" alt="" />
            ) : profile.user.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profile.user.fullName}</h1>
            {isWorker && profile.workerProfile && (
              <p className="text-lg text-gray-600">{profile.workerProfile.title}</p>
            )}
            {isWorker && profile.workerProfile && (
              <div className="flex items-center gap-4 mt-2">
                <RatingDisplay average={profile.workerProfile.ratingAverage} count={profile.workerProfile.ratingCount} />
                <AvailabilityBadge availability={profile.workerProfile.availability} />
              </div>
            )}
            {isEmployer && (
              <div className="flex items-center gap-4 mt-2">
                <RatingDisplay average={profile.employerStats.ratingAverage} count={profile.employerStats.ratingCount} />
                <span className="text-sm text-gray-500 bg-blue-50 px-2 py-0.5 rounded-full">Nhà tuyển dụng</span>
              </div>
            )}
            {profile.user.bio && <p className="text-gray-600 mt-2">{profile.user.bio}</p>}
          </div>
        </div>
      </div>

      {/* Worker Details */}
      {isWorker && profile.workerProfile && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">{profile.workerProfile.hourlyRate ? `${profile.workerProfile.hourlyRate.toLocaleString('vi-VN')}đ` : '—'}</p>
              <p className="text-sm text-gray-500">Giá/giờ</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">{profile.workerProfile.experienceYears ?? '—'}</p>
              <p className="text-sm text-gray-500">Năm kinh nghiệm</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">{profile.workerProfile.jobsCompleted}</p>
              <p className="text-sm text-gray-500">Jobs hoàn thành</p>
            </div>
          </div>

          {profile.workerProfile.skills.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Kỹ năng</h2>
              <div className="flex flex-wrap gap-2">
                {profile.workerProfile.skills.map(s => (
                  <span key={s.id} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">{s.name}</span>
                ))}
              </div>
            </div>
          )}

          {profile.workerProfile.portfolioUrl && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Portfolio</h2>
              <a href={profile.workerProfile.portfolioUrl} target="_blank" className="text-indigo-600 hover:underline">{profile.workerProfile.portfolioUrl}</a>
            </div>
          )}
        </>
      )}

      {/* Employer Stats */}
      {isEmployer && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{profile.employerStats.totalJobsPosted}</p>
            <p className="text-sm text-gray-500">Jobs đã đăng</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{profile.employerStats.activeJobs}</p>
            <p className="text-sm text-gray-500">Jobs đang tuyển</p>
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      {summary && summary.totalReviews > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Phân bổ đánh giá</h2>
          <RatingDistribution distribution={summary.distribution} total={summary.totalReviews} />
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 text-lg">Đánh giá ({summary?.totalReviews || reviews.length})</h2>
          {reviews.map(r => <ReviewCard key={r.review.id} review={r} />)}
        </div>
      )}
    </div>
  );
}
