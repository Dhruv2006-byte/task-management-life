import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    info: "bg-indigo-500",
  }[type];

  const icon = {
    success: "✓",
    error: "!",
    info: "i",
  }[type];

  return (
    <div className="fixed top-6 right-6 z-[100] animate-slide-in">
      <div className={`${colors} text-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-3 min-w-[260px]`}>
        <span className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center font-bold text-sm">
          {icon}
        </span>
        <span className="font-medium text-sm">{message}</span>
        <button onClick={onClose} className="ml-auto text-white/80 hover:text-white text-lg leading-none">
          ×
        </button>
      </div>
    </div>
  );
}
