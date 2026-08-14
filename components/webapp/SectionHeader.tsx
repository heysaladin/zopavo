import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  divider?: boolean;
  className?: string;
}

export function SectionHeader({ title, description, actions, divider = false, className }: SectionHeaderProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {divider && <Separator />}
    </div>
  );
}
