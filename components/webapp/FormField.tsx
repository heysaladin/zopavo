import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  helperText,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
