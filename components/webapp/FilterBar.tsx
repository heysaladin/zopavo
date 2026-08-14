'use client';

import * as React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export interface FilterBarFilter {
  id: string;
  label: string;
}

export interface FilterBarProps {
  filters: FilterBarFilter[];
  active?: string[];
  onChange?: (active: string[]) => void;
}

export function FilterBar({ filters, active: controlledActive, onChange }: FilterBarProps) {
  const [internalActive, setInternalActive] = React.useState<string[]>([]);
  const isControlled = controlledActive !== undefined;
  const active = isControlled ? controlledActive : internalActive;

  const toggle = (id: string) => {
    const next = active.includes(id) ? active.filter((a) => a !== id) : [...active, id];
    if (!isControlled) setInternalActive(next);
    onChange?.(next);
  };

  const clearAll = () => {
    if (!isControlled) setInternalActive([]);
    onChange?.([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        <span>Filter</span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      {filters.map((filter) => {
        const isActive = active.includes(filter.id);
        return (
          <Button
            key={filter.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => toggle(filter.id)}
          >
            {filter.label}
          </Button>
        );
      })}
      {active.length > 0 && (
        <>
          <Separator orientation="vertical" className="h-4" />
          <Badge variant="secondary" className="h-7 rounded-md px-2 text-xs font-normal">
            {active.length} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-1 text-xs text-muted-foreground"
            onClick={clearAll}
          >
            <X className="h-3 w-3 mr-0.5" />
            Clear
          </Button>
        </>
      )}
    </div>
  );
}
