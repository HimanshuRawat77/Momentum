import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
  className
}) => {
  // Prevent background scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 max-h-[90vh] overflow-y-auto",
              className
            )}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)} {...props} />
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h2 className={cn("text-lg font-semibold tracking-tight text-slate-900 dark:text-white", className)} {...props} />
);

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p className={cn("text-sm text-slate-500 dark:text-slate-400", className)} {...props} />
);

export default Dialog;
