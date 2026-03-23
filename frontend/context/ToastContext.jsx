import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const TOAST_META = {
  success: {
    icon: 'check_circle',
    title: 'Success',
    shell: 'border-emerald-200/90 bg-emerald-50/95 text-emerald-900',
    iconWrap: 'bg-emerald-100 text-emerald-700',
    progress: 'bg-emerald-500',
  },
  error: {
    icon: 'error',
    title: 'Something went wrong',
    shell: 'border-rose-200/90 bg-rose-50/95 text-rose-900',
    iconWrap: 'bg-rose-100 text-rose-700',
    progress: 'bg-rose-500',
  },
  info: {
    icon: 'info',
    title: 'Notice',
    shell: 'border-sky-200/90 bg-sky-50/95 text-sky-900',
    iconWrap: 'bg-sky-100 text-sky-700',
    progress: 'bg-sky-500',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((messageOrOptions, type = 'info', duration = 2600) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const normalized = typeof messageOrOptions === 'object' && messageOrOptions !== null
      ? {
          type: messageOrOptions.type || type,
          title: messageOrOptions.title,
          message: messageOrOptions.message || '',
          duration: Number(messageOrOptions.duration || duration),
        }
      : {
          type,
          title: undefined,
          message: String(messageOrOptions || ''),
          duration,
        };

    setToasts((prev) => [...prev, { id, ...normalized }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, normalized.duration);

    return id;
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[120] flex flex-col gap-3 w-[min(92vw,380px)] pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm overflow-hidden animate-[toast-slide-in_220ms_ease-out] ${TOAST_META[toast.type]?.shell || TOAST_META.info.shell}`}
          >
            <div className="px-3.5 py-3 flex items-start gap-3">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${TOAST_META[toast.type]?.iconWrap || TOAST_META.info.iconWrap}`}>
                <span className="material-symbols-outlined text-[18px] leading-none">
                  {TOAST_META[toast.type]?.icon || TOAST_META.info.icon}
                </span>
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[13px] font-extrabold leading-4 tracking-tight">
                  {toast.title || TOAST_META[toast.type]?.title || TOAST_META.info.title}
                </p>
                <p className="mt-1 text-[13px] font-medium leading-5 break-words text-current/90">{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="h-7 w-7 rounded-full flex items-center justify-center text-current/65 hover:text-current hover:bg-white/40 transition-colors"
                aria-label="Dismiss notification"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="h-1 w-full bg-white/30">
              <div className={`h-full ${TOAST_META[toast.type]?.progress || TOAST_META.info.progress} origin-left animate-[toast-progress_var(--toast-duration,2600ms)_linear_forwards]`} style={{ '--toast-duration': `${toast.duration || 2600}ms` }} />
            </div>
          </div>
        ))}
      </div>

      <style>
        {`@keyframes toast-slide-in {
            from { opacity: 0; transform: translateY(-8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes toast-progress {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
          }`}
      </style>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
