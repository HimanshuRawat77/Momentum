import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import type { Task } from '../lib/api';
import { CheckCircle2, ListChecks, PlayCircle } from 'lucide-react';

interface TodayTaskStatsProps {
  tasks: Task[];
  isLoading: boolean;
}

const isSameLocalDay = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const TodayTaskStats: React.FC<TodayTaskStatsProps> = ({ tasks, isLoading }) => {
  const createdToday = tasks.filter((t) => isSameLocalDay(t.createdAt)).length;
  const inProgressToday = tasks.filter(
    (t) => t.status === 'IN_PROGRESS' && isSameLocalDay(t.createdAt)
  ).length;
  const completedToday = tasks.filter(
    (t) => t.completedAt && isSameLocalDay(t.completedAt)
  ).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Task Stats</CardTitle>
          <CardDescription>Loading today&apos;s task breakdown...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = [
    {
      label: 'Created Today',
      value: createdToday,
      icon: <ListChecks className="h-4 w-4" />,
      tone: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      label: 'In Progress Today',
      value: inProgressToday,
      icon: <PlayCircle className="h-4 w-4" />,
      tone: 'text-amber-600 dark:text-amber-400'
    },
    {
      label: 'Completed Today',
      value: completedToday,
      icon: <CheckCircle2 className="h-4 w-4" />,
      tone: 'text-emerald-600 dark:text-emerald-400'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Task Stats</CardTitle>
        <CardDescription>
          Snapshot for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-white/70 dark:bg-slate-900/50"
            >
              <div className={`flex items-center gap-2 text-xs font-semibold ${item.tone}`}>
                {item.icon}
                <span>{item.label}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayTaskStats;
