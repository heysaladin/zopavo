import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface SectionFooterProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Summary text shorthand — ignored if `left` is provided */
  summary?: string;
  divider?: boolean;
  className?: string;
}

export function SectionFooter({ left, right, summary, divider = false, className }: SectionFooterProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {divider && <Separator />}
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          {left ?? (summary && <span>{summary}</span>)}
        </div>
        {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
      </div>
    </div>
  );
}
