import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  separator?: boolean;
}

export interface ActionMenuProps {
  label?: string;
  items: ActionMenuItem[];
}

export function ActionMenu({ label = 'Actions', items }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {label}
          <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {items.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            {item.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={item.onClick}
              className={item.destructive ? 'text-destructive focus:text-destructive' : ''}
            >
              {item.icon && (
                <span className="[&_svg]:h-4 [&_svg]:w-4">{item.icon}</span>
              )}
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
