import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm ring-offset-background transition-all placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/50 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm ring-offset-background transition-all placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/50 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
