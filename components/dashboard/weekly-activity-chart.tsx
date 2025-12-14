'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { WeeklyActivityData } from '@/types/analytics';

interface WeeklyActivityChartProps {
  data: WeeklyActivityData[];
  isLoading?: boolean;
  action?: React.ReactNode;
}

const ACTIVITY_COLORS = {
  vocab_created: '#8b5cf6', // purple
  vocab_reviewed: '#06b6d4', // cyan
  journal_created: '#f59e0b', // amber
  roleplay_completed: '#10b981', // emerald
};

const ACTIVITY_LABELS = {
  vocab_created: 'Vocab Added',
  vocab_reviewed: 'Vocab Reviewed',
  journal_created: 'Journal Entry',
  roleplay_completed: 'Roleplay Session',
};

export function WeeklyActivityChart({ data, isLoading, action }: WeeklyActivityChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-white shadow rounded-2xl">
        <div className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Đang tải dữ liệu hoạt động...</div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 bg-white shadow rounded-2xl">
        <div className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Không có dữ liệu hoạt động</div>
        </div>
      </Card>
    );
  }

  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
  }));

  return (
    <Card className="p-6 bg-white shadow rounded-2xl h-full flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Weekly Activity</h3>
          <p className="text-sm text-muted-foreground">Your learning activities over time</p>
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="dateLabel"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => ACTIVITY_LABELS[value as keyof typeof ACTIVITY_LABELS] || value}
            />
            <Bar
              dataKey="vocab_created"
              stackId="a"
              fill={ACTIVITY_COLORS.vocab_created}
              name="vocab_created"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="vocab_reviewed"
              stackId="a"
              fill={ACTIVITY_COLORS.vocab_reviewed}
              name="vocab_reviewed"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="journal_created"
              stackId="a"
              fill={ACTIVITY_COLORS.journal_created}
              name="journal_created"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="roleplay_completed"
              stackId="a"
              fill={ACTIVITY_COLORS.roleplay_completed}
              name="roleplay_completed"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
