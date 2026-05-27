import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10 text-left",
          !selectedOption && "text-slate-400 dark:text-slate-500",
          error && "border-rose-500 focus:ring-rose-500/15 dark:border-rose-500",
        )}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200", isOpen && "transform rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-xl backdrop-blur-lg dark:border-slate-800/80 dark:bg-slate-950/90"
          >
            <div className="max-h-60 overflow-y-auto space-y-0.5">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900",
                    option.value === value && "bg-slate-100/50 text-indigo-600 dark:bg-slate-900/50 dark:text-indigo-400 font-medium"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  {option.value === value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <span className="text-xs text-rose-500 mt-1 block px-1">{error}</span>}
    </div>
  );
};

export default Select;
