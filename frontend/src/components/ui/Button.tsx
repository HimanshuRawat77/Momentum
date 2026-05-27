import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          // Variants
          variant === 'primary' && "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm",
          variant === 'secondary' && "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
          variant === 'outline' && "border border-slate-200 bg-transparent hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
          variant === 'ghost' && "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300",
          variant === 'glass' && "bg-white/40 backdrop-blur-md border border-white/20 text-slate-900 hover:bg-white/60 dark:bg-slate-900/40 dark:border-white/5 dark:text-white dark:hover:bg-slate-900/60 shadow-glass",
          variant === 'danger' && "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 shadow-sm",
          // Sizes
          size === 'sm' && "h-9 px-4 text-sm rounded-lg",
          size === 'md' && "h-11 px-6 text-sm",
          size === 'lg' && "h-13 px-8 text-base rounded-2xl",
          size === 'icon' && "h-10 w-10 p-0 rounded-lg",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-current mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
