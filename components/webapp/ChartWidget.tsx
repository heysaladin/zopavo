'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ChartWidgetProps {
  title: string;
  description?: string;
}

const dataByPeriod: Record<string, { name: string; value: number }[]> = {
  '7d': [
    { name: 'Mon', value: 420 },
    { name: 'Tue', value: 380 },
    { name: 'Wed', value: 510 },
    { name: 'Thu', value: 460 },
    { name: 'Fri', value: 620 },
    { name: 'Sat', value: 390 },
    { name: 'Sun', value: 330 },
  ],
  '30d': [
    { name: 'W1', value: 1800 },
    { name: 'W2', value: 2200 },
    { name: 'W3', value: 1950 },
    { name: 'W4', value: 2800 },
  ],
  '90d': [
    { name: 'Jan', value: 6200 },
    { name: 'Feb', value: 7800 },
    { name: 'Mar', value: 7100 },
  ],
};

export function ChartWidget({ title, description }: ChartWidgetProps) {
  const [period, setPeriod] = React.useState<'7d' | '30d' | '90d'>('7d');
  const data = dataByPeriod[period];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        <Select
          value={period}
          onValueChange={(v) => setPeriod(v as typeof period)}
        >
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7d</SelectItem>
            <SelectItem value="30d">Last 30d</SelectItem>
            <SelectItem value="90d">Last 90d</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--background))',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
