import { cn } from '@/lib/utils';

export type StatusValue =
  | 'online'
  | 'offline'
  | 'busy'
  | 'away'
  | 'pending'
  | 'active'
  | 'inactive';

export interface InlineStatusProps {
  status: StatusValue;
}

const statusConfig: Record<StatusValue, { dot: string; label: string }> = {
  online: { dot: 'bg-emerald-500', label: 'Online' },
  offline: { dot: 'bg-gray-400', label: 'Offline' },
  busy: { dot: 'bg-red-500', label: 'Busy' },
  away: { dot: 'bg-yellow-400', label: 'Away' },
  pending: { dot: 'bg-orange-400', label: 'Pending' },
  active: { dot: 'bg-emerald-500', label: 'Active' },
  inactive: { dot: 'bg-gray-400', label: 'Inactive' },
};

export function InlineStatus({ status }: InlineStatusProps) {
  const config = statusConfig[status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn('inline-block h-2 w-2 rounded-full', config.dot)}
        aria-hidden="true"
      />
      <span className="text-sm text-foreground">{config.label}</span>
    </span>
  );
}
