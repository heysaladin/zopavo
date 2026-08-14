import * as React from 'react';
import { X, Trash2, Download, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive';
}

export interface BulkActionsProps {
  selectedCount: number;
  onClear: () => void;
  actions?: BulkAction[];
}

const defaultActions: BulkAction[] = [
  { label: 'Tag', icon: <Tag />, onClick: () => {}, variant: 'outline' },
  { label: 'Export', icon: <Download />, onClick: () => {}, variant: 'outline' },
  { label: 'Delete', icon: <Trash2 />, onClick: () => {}, variant: 'destructive' },
];

export function BulkActions({ selectedCount, onClear, actions = defaultActions }: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <Badge variant="secondary" className="font-medium">
        {selectedCount} selected
      </Badge>
      <Separator orientation="vertical" className="h-5" />
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant ?? 'outline'}
          size="sm"
          className="h-7 text-xs"
          onClick={action.onClick}
        >
          {action.icon && <span className="[&_svg]:h-3 [&_svg]:w-3">{action.icon}</span>}
          {action.label}
        </Button>
      ))}
      <Separator orientation="vertical" className="h-5" />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onClear}
        aria-label="Clear selection"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
