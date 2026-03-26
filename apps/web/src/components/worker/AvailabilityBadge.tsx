import { AvailabilityType } from '@/types/marketplace';

const CONFIG: Record<AvailabilityType, { label: string; color: string }> = {
  available: { label: 'Sẵn sàng', color: 'bg-green-100 text-green-700' },
  busy: { label: 'Đang bận', color: 'bg-yellow-100 text-yellow-700' },
  unavailable: { label: 'Không sẵn sàng', color: 'bg-red-100 text-red-700' },
};

export function AvailabilityBadge({ availability }: { availability: AvailabilityType }) {
  const { label, color } = CONFIG[availability] || CONFIG.unavailable;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}
