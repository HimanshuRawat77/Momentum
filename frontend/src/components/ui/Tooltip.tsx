import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-50 shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 pointer-events-none shadow-glass",
              className
            )}
          >
            {content}
            <div className="absolute top-full left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-0.5 rotate-45 border-r border-b border-slate-200 bg-slate-900 dark:border-slate-800 dark:bg-slate-950" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
