import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface ContentShellProps {
  children: React.ReactNode;
  loading?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const maxWidthClasses: Record<NonNullable<ContentShellProps['maxWidth']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full',
};

export function ContentShell({
  children,
  loading = false,
  maxWidth = 'xl',
  className,
}: ContentShellProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto px-4 py-6',
        maxWidthClasses[maxWidth],
        className,
      )}
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
