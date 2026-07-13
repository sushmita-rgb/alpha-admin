import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUiStore } from '../store/uiStore';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useUiStore();

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50',
          text: 'text-emerald-800 dark:text-emerald-300',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        };
      case 'error':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50',
          text: 'text-rose-800 dark:text-rose-300',
          icon: <XCircle className="w-5 h-5 text-rose-500" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50',
          text: 'text-amber-800 dark:text-amber-300',
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/50',
          text: 'text-sky-800 dark:text-sky-300',
          icon: <Info className="w-5 h-5 text-sky-500" />,
        };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${styles.bg} ${styles.text}`}
            >
              <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
              <div className="flex-1 text-sm font-medium pr-2">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
