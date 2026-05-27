import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';
import { Input, Textarea } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import type { Task, TaskPriority, TaskEnergy, TaskStatus } from '../lib/api';
import { Flame, Zap, Battery, AlertCircle, CheckSquare } from 'lucide-react';

// Form validation schema
const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  energyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  category: z.string().min(1, "Category is required"),
  dueDate: z.string().min(1, "Due date is required")
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => Promise<void>;
  task?: Task | null; // Pass task to trigger edit mode
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  isLoading
}) => {
  const defaultValues = {
    title: '',
    description: '',
    status: 'TODO' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    energyLevel: 'MEDIUM' as TaskEnergy,
    category: '',
    dueDate: new Date().toISOString().split('T')[0] // default to today
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues
  });

  // Load task values if editing
  useEffect(() => {
    if (isOpen) {
      if (task) {
        reset({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          energyLevel: task.energyLevel,
          category: task.category,
          dueDate: new Date(task.dueDate).toISOString().split('T')[0]
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [task, isOpen, reset]);

  const onFormSubmit = async (data: TaskFormValues) => {
    await onSubmit({
      ...data,
      description: data.description || null
    });
    onClose();
  };

  const statusOptions = [
    { value: 'TODO', label: 'Todo', icon: <CheckSquare className="h-4 w-4 text-slate-400" /> },
    { value: 'IN_PROGRESS', label: 'In Progress', icon: <CheckSquare className="h-4 w-4 text-indigo-500" /> },
    { value: 'COMPLETED', label: 'Completed', icon: <CheckSquare className="h-4 w-4 text-emerald-500" /> }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low Priority', icon: <AlertCircle className="h-4 w-4 text-emerald-500" /> },
    { value: 'MEDIUM', label: 'Medium Priority', icon: <AlertCircle className="h-4 w-4 text-amber-500" /> },
    { value: 'HIGH', label: 'High Priority', icon: <AlertCircle className="h-4 w-4 text-rose-500" /> }
  ];

  const energyOptions = [
    { value: 'LOW', label: 'Low Energy (🔋)', icon: <Battery className="h-4 w-4 text-emerald-500" /> },
    { value: 'MEDIUM', label: 'Medium Energy (⚡)', icon: <Zap className="h-4 w-4 text-amber-500" /> },
    { value: 'HIGH', label: 'High Energy (🔥)', icon: <Flame className="h-4 w-4 text-rose-500" /> }
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{task ? 'Edit Task' : 'New Momentum Task'}</DialogTitle>
        <DialogDescription>
          {task ? 'Make modifications to your existing item.' : 'Create a highly focused item with designated priority and stamina.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 mt-2">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Title</label>
          <Input
            placeholder="Focus objective name..."
            {...register('title')}
            className={errors.title ? "border-rose-500 focus:ring-rose-500/15 dark:border-rose-500" : ""}
          />
          {errors.title && (
            <span className="text-xs text-rose-500 px-1 mt-0.5 block">{errors.title.message}</span>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Description</label>
          <Textarea
            placeholder="Additional context or checklist items..."
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category</label>
            <Input
              placeholder="e.g. Work, Health, Personal"
              {...register('category')}
              className={errors.category ? "border-rose-500 focus:ring-rose-500/15 dark:border-rose-500" : ""}
            />
            {errors.category && (
              <span className="text-xs text-rose-500 px-1 mt-0.5 block">{errors.category.message}</span>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Due Date</label>
            <div className="relative">
              <Input
                type="date"
                {...register('dueDate')}
                className={errors.dueDate ? "border-rose-500 focus:ring-rose-500/15 dark:border-rose-500" : ""}
              />
            </div>
            {errors.dueDate && (
              <span className="text-xs text-rose-500 px-1 mt-0.5 block">{errors.dueDate.message}</span>
            )}
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                options={statusOptions}
                placeholder="Choose status"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Priority</label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={priorityOptions}
                  placeholder="Choose priority"
                />
              )}
            />
          </div>

          {/* Energy Level */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Energy Level</label>
            <Controller
              name="energyLevel"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={energyOptions}
                  placeholder="Choose energy level"
                />
              )}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default TaskForm;
