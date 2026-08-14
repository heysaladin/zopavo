import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  period?: string;
  data?: number[];
}

const defaultData = [40, 55, 35, 70, 60, 85, 75];

export function MetricCard({
  title,
  value,
  change,
  changeType,
  period = 'vs last month',
  data = defaultData,
}: MetricCardProps) {
  const max = Math.max(...data);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-1 flex items-center gap-1">
          {changeType === 'increase' ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          ) : changeType === 'decrease' ? (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          ) : null}
          <span
            className={cn(
              'text-xs font-medium',
              changeType === 'increase' && 'text-emerald-600',
              changeType === 'decrease' && 'text-red-500',
              changeType === 'neutral' && 'text-muted-foreground',
            )}
          >
            {change}
          </span>
          <span className="text-xs text-muted-foreground">{period}</span>
        </div>

        {/* Mini bar chart */}
        <div className="mt-4 flex items-end gap-0.5 h-10">
          {data.map((val, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 rounded-sm',
                changeType === 'increase'
                  ? 'bg-emerald-500/20'
                  : changeType === 'decrease'
                    ? 'bg-red-500/20'
                    : 'bg-muted',
                i === data.length - 1 &&
                  (changeType === 'increase'
                    ? 'bg-emerald-500'
                    : changeType === 'decrease'
                      ? 'bg-red-500'
                      : 'bg-foreground'),
              )}
              style={{ height: `${(val / max) * 100}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
