'use client';

import * as React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AlertBannerProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantConfig = {
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100 [&>svg]:text-blue-600',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100 [&>svg]:text-emerald-600',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 [&>svg]:text-amber-600',
  },
  error: {
    icon: XCircle,
    className: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100 [&>svg]:text-red-600',
  },
};

export function AlertBanner({
  variant = 'info',
  title,
  description,
  dismissible = false,
  onDismiss,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Alert className={cn('relative', config.className)}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 opacity-70 hover:opacity-100"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </Alert>
  );
}
