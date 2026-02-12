import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-100 border-green-500',
    error: 'bg-red-100 border-red-500',
    warning: 'bg-yellow-100 border-yellow-500',
    info: 'bg-blue-100 border-blue-500',
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-pixel-bounce">
      <div className={`${bgColors[type]} border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-4 max-w-md`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{icons[type]}</span>
          <p className="text-sm font-bold flex-1">{message}</p>
          <button
            onClick={onClose}
            className="text-xl font-bold hover:scale-110 transition-transform"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;

// Toast管理器Hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{ id: number; message: string; type: ToastProps['type'] }>>([]);

  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
};
