import { X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const borderColors = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  info: 'border-l-black',
};

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 bg-white px-5 py-4 shadow-lg border-l-4
            ${borderColors[toast.type] || borderColors.info}
            transition-all duration-300 ease-out min-w-[300px] max-w-[420px]
            ${toast.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
          `}
        >
          <p className="font-sans text-[13px] text-black flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-warm-gray hover:text-black transition-colors flex-shrink-0"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  );
}
