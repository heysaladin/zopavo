'use client';

import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

export function SearchInput({
  value: controlledValue,
  onChange,
  placeholder = 'Search…',
  loading = false,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = React.useState('');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue('');
    onChange?.('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-8 pr-8"
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : value ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
