'use client';

import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Search,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => onOpenChange(false)}>
            <LayoutDashboard />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => onOpenChange(false)}>
            <Users />
            Users
          </CommandItem>
          <CommandItem onSelect={() => onOpenChange(false)}>
            <Settings />
            Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => onOpenChange(false)}>
            <FileText />
            New Document
          </CommandItem>
          <CommandItem onSelect={() => onOpenChange(false)}>
            <Search />
            Search Files
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
