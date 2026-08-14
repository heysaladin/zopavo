import * as React from 'react';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const inlineCtaVariants = cva(
  'flex items-center gap-4 rounded-lg border px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted/50',
        info:    'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
        warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100',
        upgrade: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface InlineCtaProps extends VariantProps<typeof inlineCtaVariants> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function InlineCta({
  icon,
  title,
  description,
  action,
  variant,
  dismissible,
  onDismiss,
  className,
}: InlineCtaProps) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <div className={cn(inlineCtaVariants({ variant }), className)}>
      {icon && <span className="shrink-0 [&_svg]:size-4">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{title}</p>
        {description && <p className="mt-0.5 text-xs opacity-80">{description}</p>}
      </div>
      {action && (
        action.href
          ? <a href={action.href} className="shrink-0 rounded-md border border-current px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80">{action.label}</a>
          : <Button size="sm" variant="outline" onClick={action.onClick} className="shrink-0 h-7 text-xs">{action.label}</Button>
      )}
      {dismissible && (
        <button onClick={handleDismiss} className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
