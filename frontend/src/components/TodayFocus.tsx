import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import type { Task, TaskEnergy } from '../lib/api';
import { Flame, Zap, Battery, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TodayFocusProps {
  tasks: Task[];
  backlogTasks: Task[];
  onToggleStatus: (id: string, currentStatus: string) => void;
  onStartTask: (id: string) => void;
  isLoading: boolean;
  profileName?: string;
}

export const TodayFocus: React.FC<TodayFocusProps> = ({
  tasks,
  backlogTasks,
  onToggleStatus,
  onStartTask,
  isLoading,
  profileName = 'Builder'
}) => {
  const [selectedEnergy, setSelectedEnergy] = useState<TaskEnergy>('MEDIUM');

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  // Filter tasks that are scheduled for today (dueDate is today or earlier and not completed)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayTasks = tasks.filter(t => {
    const dueDate = new Date(t.dueDate);
    // Include overdue tasks or tasks due today
    return dueDate <= endOfToday || t.status === 'IN_PROGRESS';
  });

  const todayCompleted = todayTasks.filter(t => t.status === 'COMPLETED');
  const todayRemaining = todayTasks.filter(t => t.status !== 'COMPLETED');

  // Recommendation engine: Filter active backlog tasks matching selected energy level
  const recommendations = backlogTasks
    .filter(t => t.status !== 'COMPLETED' && t.energyLevel === selectedEnergy)
    .slice(0, 3); // Recommend top 3

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Greeting and Today's Agenda */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Hero Card */}
        <Card className="bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-transparent border-indigo-100/40 dark:border-indigo-900/10">
          <CardContent className="p-8">
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
              {formattedDate}
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
              {greeting()}, {profileName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">
              {todayRemaining.length > 0 
                ? `You have ${todayRemaining.length} tasks to focus on today. Let's make it a productive one!`
                : "All caught up! Select your energy level to pull in new tasks."}
            </p>
          </CardContent>
        </Card>

        {/* Today's Focus List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Focus Agenda</CardTitle>
              <CardDescription>High-priority items requiring action today</CardDescription>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full dark:bg-indigo-950/40 dark:text-indigo-400">
              {todayCompleted.length}/{todayTasks.length} Completed
            </span>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-full text-slate-400 mb-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-white">Clear Agenda</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                  No scheduled items for today. Add tasks from the backlog below or create a new one.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {todayTasks.map((task) => {
                    const isCompleted = task.status === 'COMPLETED';
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all",
                          isCompleted
                            ? "bg-slate-50/50 border-slate-100 dark:bg-slate-900/20 dark:border-slate-800/50"
                            : "bg-white border-slate-200/80 hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-slate-700 shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onToggleStatus(task.id, task.status)}
                            className={cn(
                              "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors",
                              isCompleted && "text-emerald-500 hover:text-emerald-600"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                          <div>
                            <h4 className={cn(
                              "text-sm font-semibold text-slate-800 dark:text-white",
                              isCompleted && "line-through text-slate-400 dark:text-slate-500 font-normal"
                            )}>
                              {task.title}
                            </h4>
                            <div className="flex gap-2 items-center mt-1">
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {task.category}
                              </span>
                              {task.priority === 'HIGH' && (
                                <span className="flex items-center text-[10px] text-rose-500 font-medium">
                                  <AlertCircle className="h-3 w-3 mr-0.5" /> High
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {task.status === 'TODO' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onStartTask(task.id)}
                            className="text-xs h-8 px-3"
                          >
                            Start Focus
                          </Button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Energy Level suggestion side panel */}
      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Energy Optimizer</CardTitle>
            <CardDescription>Match your tasks with your current stamina</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Energy Picker buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedEnergy('LOW')}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                  selectedEnergy === 'LOW'
                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-200/80 bg-white/30 dark:border-slate-800 dark:bg-slate-900/30 text-slate-500"
                )}
              >
                <Battery className="h-5 w-5 mb-1" />
                <span className="text-xs font-semibold">Low</span>
                <span className="text-[9px] opacity-75">Routine</span>
              </button>

              <button
                onClick={() => setSelectedEnergy('MEDIUM')}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                  selectedEnergy === 'MEDIUM'
                    ? "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                    : "border-slate-200/80 bg-white/30 dark:border-slate-800 dark:bg-slate-900/30 text-slate-500"
                )}
              >
                <Zap className="h-5 w-5 mb-1" />
                <span className="text-xs font-semibold">Medium</span>
                <span className="text-[9px] opacity-75">Standard</span>
              </button>

              <button
                onClick={() => setSelectedEnergy('HIGH')}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                  selectedEnergy === 'HIGH'
                    ? "border-rose-500 bg-rose-500/5 text-rose-600 dark:text-rose-400"
                    : "border-slate-200/80 bg-white/30 dark:border-slate-800 dark:bg-slate-900/30 text-slate-500"
                )}
              >
                <Flame className="h-5 w-5 mb-1" />
                <span className="text-xs font-semibold">High</span>
                <span className="text-[9px] opacity-75">Deep Work</span>
              </button>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Recommended Actions
              </h4>

              {recommendations.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-400">
                    No backlog items for {selectedEnergy.toLowerCase()} energy.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recommendations.map(task => (
                    <div 
                      key={task.id}
                      className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl dark:bg-slate-900/30 dark:border-slate-800/40 flex justify-between items-center"
                    >
                      <div className="truncate pr-2">
                        <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {task.title}
                        </h5>
                        <span className="text-[9px] font-medium text-slate-400">
                          {task.category} • {task.priority} Priority
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onStartTask(task.id)}
                        className="h-7 px-2.5 text-[10px] rounded-lg shrink-0"
                      >
                        Do Now
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper inside file
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default TodayFocus;
