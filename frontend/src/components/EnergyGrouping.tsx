import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import type { Task, TaskEnergy } from '../lib/api';
import { Flame, Zap, Battery, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnergyGroupingProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  isLoading: boolean;
}

export const EnergyGrouping: React.FC<EnergyGroupingProps> = ({
  tasks,
  onEditTask,
  isLoading
}) => {
  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED');

  const getTasksByEnergy = (energy: TaskEnergy) => {
    return activeTasks.filter(t => t.energyLevel === energy);
  };

  const columns: { id: TaskEnergy; title: string; subtitle: string; icon: React.ReactNode; color: string; bg: string }[] = [
    {
      id: 'LOW',
      title: 'Low Energy',
      subtitle: '🔋 Routine & administrative tasks',
      icon: <Battery className="h-5 w-5" />,
      color: 'text-emerald-500 border-emerald-500/10',
      bg: 'bg-emerald-500/5'
    },
    {
      id: 'MEDIUM',
      title: 'Medium Energy',
      subtitle: '⚡ Standard creative focus tasks',
      icon: <Zap className="h-5 w-5" />,
      color: 'text-amber-500 border-amber-500/10',
      bg: 'bg-amber-500/5'
    },
    {
      id: 'HIGH',
      title: 'High Energy',
      subtitle: '🔥 Deep work & intensive items',
      icon: <Flame className="h-5 w-5" />,
      color: 'text-rose-500 border-rose-500/10',
      bg: 'bg-rose-500/5'
    }
  ];

  const formatDateString = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {columns.map(col => {
        const colTasks = getTasksByEnergy(col.id);

        return (
          <Card key={col.id} className="flex flex-col max-h-[70vh]">
            <CardHeader className="pb-3 border-b border-slate-100/50 dark:border-slate-800/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg border", col.color, col.bg)}>
                    {col.icon}
                  </div>
                  <CardTitle className="text-base">{col.title}</CardTitle>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {colTasks.length}
                </span>
              </div>
              <CardDescription className="text-xs pt-1">{col.subtitle}</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 mt-3 scrollbar-thin">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    No active tasks in this column.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {colTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layoutId={task.id}
                      onClick={() => onEditTask(task)}
                      className="group cursor-pointer p-4 bg-white border border-slate-200/80 rounded-xl hover:border-indigo-500/40 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-indigo-400/40 shadow-sm transition-all relative overflow-hidden"
                    >
                      {/* Priority accent top border */}
                      {task.priority === 'HIGH' && <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500" />}
                      {task.priority === 'MEDIUM' && <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500" />}
                      {task.priority === 'LOW' && <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500" />}

                      <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-800/40">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {task.category}
                        </span>

                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[10px]">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDateString(task.dueDate)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Internal classname utility
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default EnergyGrouping;
