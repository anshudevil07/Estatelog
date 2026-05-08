import { createContext, useContext, useState, useCallback } from "react";
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamationCircle, HiX } from "react-icons/hi";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Convenience methods
  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
    warning: (msg) => addToast(msg, "warning"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const styles = {
    success: {
      container: "bg-emerald-600 text-white",
      icon: <HiCheckCircle className="w-5 h-5 shrink-0" />,
    },
    error: {
      container: "bg-red-600 text-white",
      icon: <HiXCircle className="w-5 h-5 shrink-0" />,
    },
    info: {
      container: "bg-blue-600 text-white",
      icon: <HiInformationCircle className="w-5 h-5 shrink-0" />,
    },
    warning: {
      container: "bg-amber-500 text-white",
      icon: <HiExclamationCircle className="w-5 h-5 shrink-0" />,
    },
  };

  const style = styles[toast.type] || styles.info;

  return (
    <div
      className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl ${style.container}`}
    >
      {style.icon}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="opacity-80 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <HiX className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
