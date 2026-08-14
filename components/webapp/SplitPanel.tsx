import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface SplitPanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: string;
  className?: string;
}

export function SplitPanel({
  left,
  right,
  leftWidth = '280px',
  className,
}: SplitPanelProps) {
  return (
    <div className={cn('flex h-full min-h-0 overflow-hidden rounded-lg border', className)}>
      {/* Left panel */}
      <div style={{ width: leftWidth, minWidth: leftWidth }} className="flex flex-col shrink-0">
        <ScrollArea className="flex-1">{left}</ScrollArea>
      </div>

      {/* Drag handle visual */}
      <div className="relative flex items-center">
        <div className="w-px h-full bg-border" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-0.5 py-1 px-0.5 rounded bg-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-1 w-0.5 rounded-full bg-muted-foreground/40" />
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 min-w-0">
        <ScrollArea className="h-full">{right}</ScrollArea>
      </div>
    </div>
  );
}
