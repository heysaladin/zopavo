import * as React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="space-y-2">
      {breadcrumb && <div>{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight truncate">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
