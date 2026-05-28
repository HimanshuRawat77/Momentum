import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import type { DashboardStats as StatsType } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle2, Zap } from 'lucide-react';

interface DashboardStatsProps {
  stats: StatsType | null;
  isLoading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-6 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-white/30 dark:bg-slate-900/30">
            <div className="h-32"></div>
          </Card>
        ))}
      </div>
    );
  }

  const {
    completionRate,
    activeTasksCount,
    completedTodayCount,
    categoryData
  } = stats;

  // Palette colors for the chart
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">

        {/* Completion Rate Card */}
        <Card className="p-6 flex flex-row items-center gap-5">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Completion Rate</span>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{completionRate}%</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {completedTodayCount} tasks completed today
            </p>
          </div>
        </Card>

        {/* Active Tasks Card */}
        <Card className="p-6 flex flex-row items-center gap-5">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Tasks</span>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{activeTasksCount}</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              In progress or backlog
            </p>
          </div>
        </Card>

      </div>

      {/* Analytics Charts */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Visualizing task distribution across categories</CardDescription>
          </CardHeader>
          <CardContent className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(226, 232, 240, 0.8)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    backdropFilter: 'blur(8px)',
                    color: '#1e293b'
                  }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardStats;
