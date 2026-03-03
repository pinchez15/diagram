'use client';

import { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  variant: ToastVariant;
  message: string;
}

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle; bg: string; border: string; text: string }> = {
  success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-success', text: 'text-green-800' },
  error: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-error', text: 'text-red-800' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50', border: 'border-warning', text: 'text-yellow-800' },
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-info', text: 'text-blue-800' },
};

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-md ${config.bg} ${config.border} ${config.text} animate-in slide-in-from-right`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 rounded p-0.5 hover:bg-black/5">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
