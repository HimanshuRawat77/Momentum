import React from 'react';
import type { Task } from '../lib/api';
import { cn, formatDate } from '../lib/utils';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Edit2, Trash2, Calendar, Flame, Zap, Battery } from 'lucide-react';
import { Button } from './ui/Button';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete
}) => {
  const isCompleted = task.status === 'COMPLETED';
  const isOverdue = new Date(task.dueDate) < new Date() && !isCompleted;

  const getEnergyIcon = (energy: string) => {
    if (energy === 'HIGH') return <Flame className="h-3 w-3 text-rose-500" />;
    if (energy === 'MEDIUM') return <Zap className="h-3 w-3 text-amber-500" />;
    return <Battery className="h-3.5 w-3.5 text-emerald-500" />;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'HIGH') return 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
    if (priority === 'MEDIUM') return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border rounded-2xl hover:shadow-premium transition-all dark:bg-slate-900/60 shadow-sm relative overflow-hidden group/item",
        isCompleted 
          ? "border-slate-100 bg-slate-50/40 dark:border-slate-800/40 dark:bg-slate-950/20" 
          : "border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
      )}
    >
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Toggle Status Checkbox */}
        <button
          type="button"
          onClick={() => onToggleStatus(task.id, task.status)}
          aria-label={isCompleted ? `Mark ${task.title} as todo` : `Mark ${task.title} as completed`}
          className={cn(
            "mt-1 text-slate-300 hover:text-indigo-600 dark:text-slate-700 dark:hover:text-indigo-400 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 rounded-full",
            isCompleted && "text-emerald-500 hover:text-emerald-600"
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5.5 w-5.5" />
          ) : (
            <Circle className="h-5.5 w-5.5" />
          )}
        </button>

        {/* Task text information */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn(
              "text-sm font-semibold text-slate-800 dark:text-white truncate",
              isCompleted && "line-through text-slate-400 dark:text-slate-500 font-normal"
            )}>
              {task.title}
            </h3>
            
            {/* Status indicators */}
            {task.status === 'IN_PROGRESS' && (
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20">
                In Progress
              </span>
            )}
          </div>

          {task.description && (
            <p className={cn(
              "text-xs text-slate-500 dark:text-slate-400 line-clamp-2",
              isCompleted && "opacity-60"
            )}>
              {task.description}
            </p>
          )}

          {/* Badges and metadata */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px]">
            {/* Category */}
            <span className="font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full dark:bg-slate-800 dark:text-slate-400 border border-slate-200/20 dark:border-slate-700/20">
              {task.category}
            </span>

            {/* Energy Level */}
            <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
              {getEnergyIcon(task.energyLevel)}
              <span>{task.energyLevel.toLowerCase()} energy</span>
            </span>

            {/* Priority */}
            <span className={cn("px-2 py-0.5 rounded-md border font-semibold", getPriorityColor(task.priority))}>
              {task.priority}
            </span>

            {/* Due Date */}
            <span className={cn(
              "flex items-center gap-1 font-medium",
              isOverdue ? "text-rose-500" : "text-slate-400 dark:text-slate-500"
            )}>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
              {isOverdue && <span className="font-bold shrink-0">(Overdue)</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Actions (Edit / Delete) */}
      <div className="flex items-center gap-1.5 mt-4 md:mt-0 ml-9 md:ml-4 shrink-0 md:opacity-0 md:group-hover\/item:opacity-100 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
          className="h-8.5 w-8.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:hover:bg-slate-800"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete ${task.title}`}
          className="h-8.5 w-8.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default TaskItem;
