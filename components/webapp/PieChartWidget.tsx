'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface PieChartSlice {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartWidgetProps {
  title: string;
  description?: string;
  data?: PieChartSlice[];
  donut?: boolean;
}

const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#f87171',
  '#a78bfa',
];

const DEFAULT_DATA: PieChartSlice[] = [
  { name: 'Strategic Direction', value: 34 },
  { name: 'Operations',          value: 28 },
  { name: 'Growth',              value: 21 },
  { name: 'Advisory',            value: 17 },
];

export function PieChartWidget({ title, description, data = DEFAULT_DATA, donut = false }: PieChartWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={donut ? 55 : 0}
              outerRadius={80}
              paddingAngle={donut ? 3 : 1}
              dataKey="value"
            >
              {data.map((slice, i) => (
                <Cell
                  key={slice.name}
                  fill={slice.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--background))',
              }}
              formatter={(value) => [`${value}%`, '']}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
