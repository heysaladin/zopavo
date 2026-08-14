import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface ActivityGaugeProps {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

const SIZE = { sm: 80, md: 120, lg: 160 };
const STROKE = { sm: 8, md: 10, lg: 12 };

const TRACK_COLOR = 'hsl(var(--muted))';
const FILL_COLOR: Record<NonNullable<ActivityGaugeProps['color']>, string> = {
  primary: 'hsl(var(--primary))',
  success: '#10b981',
  warning: '#f59e0b',
  error:   '#ef4444',
};

export function ActivityGauge({
  value,
  max = 100,
  label,
  sublabel,
  size = 'md',
  color = 'primary',
  className,
}: ActivityGaugeProps) {
  const diameter = SIZE[size];
  const stroke = STROKE[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference * (1 - pct);
  const cx = diameter / 2;

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center gap-2 p-4">
        <div className="relative" style={{ width: diameter, height: diameter }}>
          <svg width={diameter} height={diameter} className="-rotate-90">
            <circle cx={cx} cy={cx} r={radius} fill="none" stroke={TRACK_COLOR} strokeWidth={stroke} />
            <circle
              cx={cx} cy={cx} r={radius}
              fill="none"
              stroke={FILL_COLOR[color]}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-bold leading-none', size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-base')}>
              {Math.round(pct * 100)}%
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">{label}</p>
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
