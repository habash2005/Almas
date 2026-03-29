import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type, visible: true }]);

    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => (t.id === id ? { ...t, visible: false } : t))
      );
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, duration);
  }, []);

  const addToast = showToast;

  const removeToast = useCallback((id) => {
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, visible: false } : t))
    );
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
