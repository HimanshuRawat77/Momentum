import React, { useState } from 'react';
import type { Task, FetchTasksParams, TaskStatus } from '../lib/api';
import TaskItem from './TaskItem';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Search, SlidersHorizontal, Plus, Inbox, ClipboardList, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (id: string, currentStatus: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onNewTask: () => void;
  filters: FetchTasksParams;
  onFiltersChange: (newFilters: FetchTasksParams) => void;
  isLoading: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onNewTask,
  filters,
  onFiltersChange,
  isLoading
}) => {
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleStatusToggle = (status: TaskStatus | 'ALL') => {
    if (status === 'ALL') {
      onFiltersChange({ ...filters, status: [] });
    } else {
      // Toggle logic or simple single-select tabs
      onFiltersChange({ ...filters, status: [status] });
    }
  };

  const handleEnergyChange = (energy: string) => {
    onFiltersChange({ 
      ...filters, 
      energyLevel: energy === 'ALL' ? undefined : energy 
    });
  };

  const handleSortChange = (sortBy: string) => {
    const isCurrentlySame = filters.sortBy === sortBy;
    const sortOrder = isCurrentlySame && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFiltersChange({ 
      ...filters, 
      sortBy, 
      sortOrder 
    });
  };

  const currentStatusFilter = filters.status && filters.status.length > 0 
    ? (filters.status[0] as TaskStatus) 
    : 'ALL';

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'energyLevel', label: 'Energy Level' },
    { value: 'createdAt', label: 'Date Created' }
  ];

  const energyOptions = [
    { value: 'ALL', label: 'All Energy Levels' },
    { value: 'LOW', label: 'Low Energy (🔋)' },
    { value: 'MEDIUM', label: 'Medium Energy (⚡)' },
    { value: 'HIGH', label: 'High Energy (🔥)' }
  ];

  // Helper to determine active sort indicators
  const getSortIcon = (field: string) => {
    if (filters.sortBy === field) {
      return (
        <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-1 rounded ml-1 shrink-0 font-bold">
          {filters.sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search objectives..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="pl-10 h-10 w-full"
            aria-label="Search objectives"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
            aria-expanded={showAdvanceFilters}
            aria-label="Toggle advanced filters"
            className={cn(
              "h-10 px-3 w-auto flex gap-2 text-xs font-semibold shrink-0",
              (filters.energyLevel || showAdvanceFilters) && "border-indigo-500/50 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </Button>

          <Button 
            onClick={onNewTask}
            className="h-10 px-4 text-xs font-semibold flex gap-1.5 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 ml-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Objective</span>
          </Button>
        </div>
      </div>

      {/* Advanced Filter Box */}
      {showAdvanceFilters && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-slate-200/80 bg-white/40 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/30"
        >
          {/* Energy Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Energy Requirement</label>
            <Select
              value={filters.energyLevel || 'ALL'}
              onChange={handleEnergyChange}
              options={energyOptions}
            />
          </div>

          {/* Sort Menu */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort By</label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSortChange(opt.value)}
                  className={cn(
                    "flex items-center text-xs font-medium px-3 py-2 rounded-xl border transition-all",
                    filters.sortBy === opt.value
                      ? "border-indigo-500 text-indigo-600 bg-indigo-500/5 dark:border-indigo-400 dark:text-indigo-400"
                      : "border-slate-200/80 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                  )}
                >
                  <span>{opt.label}</span>
                  {getSortIcon(opt.value)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs / Status Filter Pills */}
      <div className="flex border-b border-slate-100 dark:border-slate-800/40 pb-px gap-1">
        {(['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'] as const).map(status => (
          <button
            key={status}
            type="button"
            onClick={() => handleStatusToggle(status)}
            className={cn(
              "text-xs font-semibold px-4 py-3 relative border-b-2 border-transparent transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
              currentStatusFilter === status && "text-slate-950 border-slate-900 font-bold dark:text-white dark:border-indigo-500"
            )}
          >
            {status === 'ALL' && 'All Tasks'}
            {status === 'TODO' && 'Todo'}
            {status === 'IN_PROGRESS' && 'In Progress'}
            {status === 'COMPLETED' && 'Completed'}
          </button>
        ))}
      </div>

      {/* Task List Items */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl dark:bg-slate-900/30 dark:border-slate-800/50 animate-pulse gap-4">
              <div className="flex gap-4 flex-1 w-full">
                <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 mt-1 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-1/4 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        // Empty State
        <Card className="relative overflow-hidden flex flex-col items-center justify-center p-10 py-16 text-center border-dashed border-slate-300/70 dark:border-slate-700/60">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_45%)]" />
          <div className="relative p-4 bg-white/70 dark:bg-slate-800/40 rounded-full text-slate-400 mb-4 animate-float">
            {currentStatusFilter === 'COMPLETED' ? (
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            ) : currentStatusFilter === 'IN_PROGRESS' ? (
              <ClipboardList className="h-10 w-10 text-indigo-500" />
            ) : (
              <Inbox className="h-10 w-10 text-slate-400" />
            )}
          </div>
          <h3 className="relative text-lg font-bold text-slate-800 dark:text-white">
            {currentStatusFilter === 'COMPLETED' ? 'No completed tasks yet' : 'Empty backlogs'}
          </h3>
          <p className="relative text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
            {currentStatusFilter === 'COMPLETED' 
              ? 'Complete tasks to fill up your dashboard progress ring and heatmap grid.'
              : 'Add tasks, classify energy levels, and set priorities to align your workflow.'}
          </p>
          <Button 
            onClick={onNewTask} 
            className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold px-5 h-9"
          >
            Create Your First Task
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};

// Helper inside file
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default TaskList;
