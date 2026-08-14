'use client';

import * as React from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export interface DataTableRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface DataTableProps {
  data?: DataTableRow[];
  pageSize?: number;
}

const defaultData: DataTableRow[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: '2', name: 'Bob Martinez', email: 'bob@example.com', role: 'Editor', status: 'active' },
  { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'pending' },
  { id: '4', name: 'David Kim', email: 'david@example.com', role: 'Editor', status: 'inactive' },
  { id: '5', name: 'Eva Chen', email: 'eva@example.com', role: 'Admin', status: 'active' },
];

const statusVariant: Record<DataTableRow['status'], 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  pending: 'outline',
};

export function DataTable({ data = defaultData, pageSize = 5 }: DataTableProps) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [sortAsc, setSortAsc] = React.useState(true);
  const [page, setPage] = React.useState(0);

  const sorted = React.useMemo(
    () => [...data].sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))),
    [data, sortAsc],
  );

  const pageCount = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice(page * pageSize, page * pageSize + pageSize);

  const allSelected = pageData.every((r) => selected.includes(r.id));
  const toggleAll = () =>
    setSelected(allSelected ? selected.filter((id) => !pageData.find((r) => r.id === id)) : Array.from(new Set([...selected, ...pageData.map((r) => r.id)])));
  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  return (
    <div className="w-full space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => setSortAsc((v) => !v)}
                >
                  Name
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((row) => (
              <TableRow key={row.id} data-state={selected.includes(row.id) ? 'selected' : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(row.id)}
                    onCheckedChange={() => toggleRow(row.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-muted-foreground">{row.email}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[row.status]} className="capitalize">
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-xs text-muted-foreground">
                {selected.length} of {data.length} row(s) selected.
              </TableCell>
              <TableCell colSpan={2} className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs">
                    {page + 1} / {pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={page >= pageCount - 1}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
