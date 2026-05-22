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
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    error: <XCircle className="w-4 h-4 text-destructive" />,
    info: <Info className="w-4 h-4 text-primary" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border text-sm shadow-lg",
        "bg-popover border-border text-popover-foreground"
      )}>
        {icons[toast.type]}
        <span>{toast.message}</span>
        <button onClick={clearToast} className="ml-1 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
