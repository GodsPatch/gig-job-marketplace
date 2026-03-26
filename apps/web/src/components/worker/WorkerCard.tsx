import Link from 'next/link';
import { WorkerCardData } from '@/types/marketplace';
import { AvailabilityBadge } from './AvailabilityBadge';
import { StarRating } from '../review/StarRating';

export function WorkerCard({ worker }: { worker: WorkerCardData }) {
  return (
    <Link href={`/users/${worker.userId}`} className="block group">
      <div className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-lg hover:border-indigo-200 transition-all">
        <div className="flex items-start gap-4 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {worker.avatarUrl ? (
              <img src={worker.avatarUrl} alt={worker.fullName} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              worker.fullName.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{worker.fullName}</h3>
            <p className="text-sm text-gray-600 truncate">{worker.title}</p>
          </div>
          <AvailabilityBadge availability={worker.availability} />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <StarRating value={Math.round(worker.ratingAverage)} readonly size="sm" />
          <span className="text-sm font-medium">{worker.ratingAverage.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({worker.ratingCount})</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {worker.skills.slice(0, 5).map(s => (
            <span key={s.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full">{s.name}</span>
          ))}
          {worker.skills.length > 5 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{worker.skills.length - 5}</span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
          <span>{worker.hourlyRate ? `${worker.hourlyRate.toLocaleString('vi-VN')}đ/giờ` : 'Thỏa thuận'}</span>
          <span>{worker.experienceYears ? `${worker.experienceYears} năm KN` : ''}</span>
          <span>{worker.jobsCompleted} jobs</span>
        </div>
      </div>
    </Link>
  );
}
