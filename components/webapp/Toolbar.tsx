import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ToolbarAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

export interface ToolbarProps {
  title?: string;
  actions?: ToolbarAction[];
}

export function Toolbar({ title, actions = [] }: ToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center justify-between gap-4 rounded-lg border bg-background px-3 py-2">
        {/* Left slot */}
        <div>
          {title && <p className="text-sm font-medium">{title}</p>}
        </div>

        {/* Right slot */}
        {actions.length > 0 && (
          <div className="flex items-center gap-1">
            {actions.map((action, index) => (
              <React.Fragment key={action.label}>
                {index > 0 && action.variant === 'ghost' && actions[index - 1]?.variant !== 'ghost' && (
                  <Separator orientation="vertical" className="h-5 mx-1" />
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={action.variant ?? 'ghost'}
                      size={action.icon && !action.label ? 'icon' : 'sm'}
                      onClick={action.onClick}
                    >
                      {action.icon && <span>{action.icon}</span>}
                      {action.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{action.label}</TooltipContent>
                </Tooltip>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
