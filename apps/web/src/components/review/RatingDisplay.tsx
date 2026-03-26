import { StarRating } from './StarRating';

interface RatingDisplayProps {
  average: number;
  count: number;
  showCount?: boolean;
}

export function RatingDisplay({ average, count, showCount = true }: RatingDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <StarRating value={Math.round(average)} readonly size="sm" />
      <span className="font-semibold text-gray-900">{average.toFixed(1)}</span>
      {showCount && <span className="text-sm text-gray-500">({count} đánh giá)</span>}
    </div>
  );
}
