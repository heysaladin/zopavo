import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number;
  description?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, trend, description, icon }: StatCardProps) {
  const TrendIcon =
    trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  const trendColor =
    trend === undefined
      ? ''
      : trend > 0
        ? 'text-emerald-600'
        : trend < 0
          ? 'text-red-500'
          : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">{icon}</span>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(TrendIcon || description) && (
          <div className="flex items-center gap-1 mt-1">
            {TrendIcon && trend !== undefined && (
              <span className={cn('flex items-center gap-0.5 text-xs font-medium', trendColor)}>
                <TrendIcon className="h-3 w-3" />
                {Math.abs(trend)}%
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
