import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(({ title, description, variant = 'info' }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      dismiss(id);
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast Render Area */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="pointer-events-auto w-full rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 flex gap-3 items-start"
            >
              {/* Icon based on variant */}
              <div className="mt-0.5">
                {t.variant === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                {t.variant === 'error' && <AlertCircle className="h-5 w-5 text-rose-500" />}
                {t.variant === 'info' && <Info className="h-5 w-5 text-indigo-500" />}
              </div>

              {/* Text */}
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                  {t.title}
                </h4>
                {t.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.description}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => dismiss(t.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
