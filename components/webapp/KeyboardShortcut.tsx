import { cn } from '@/lib/utils';

export interface KeyboardShortcutProps {
  keys: string[];
  label?: string;
  className?: string;
}

export function KeyboardShortcut({ keys, label, className }: KeyboardShortcutProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {label && (
        <span className="mr-1 text-sm text-muted-foreground">{label}</span>
      )}
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="inline-flex items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border))]"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
