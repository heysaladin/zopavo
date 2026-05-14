"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export function ToastProvider() {
  const { toast, clearToast } = useAppStore();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3500);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm shadow-2xl",
        "bg-zinc-900 border-white/10 text-zinc-100"
      )}>
        {icons[toast.type]}
        <span>{toast.message}</span>
        <button onClick={clearToast} className="ml-1 text-zinc-500 hover:text-zinc-300">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
