import { create } from "zustand";

export type ToastVariant = "info" | "success" | "warning" | "error";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

export type ToastItem = ToastInput & {
  id: string;
};

type ToastState = {
  toasts: ToastItem[];
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
};

const toastTimers = new Map<string, number>();
let toastSequence = 0;

function createToastId() {
  toastSequence += 1;
  return `toast-${Date.now()}-${toastSequence}`;
}

function clearToastTimer(id: string) {
  const timeout = toastTimers.get(id);
  if (timeout) {
    window.clearTimeout(timeout);
    toastTimers.delete(id);
  }
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = createToastId();
    const duration = toast.duration ?? 5000;
    const nextToast: ToastItem = {
      id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant ?? "info",
      duration,
    };

    set({ toasts: [nextToast, ...get().toasts].slice(0, 4) });

    if (typeof window !== "undefined" && duration > 0) {
      clearToastTimer(id);
      const timeout = window.setTimeout(() => {
        get().dismissToast(id);
      }, duration);
      toastTimers.set(id, timeout);
    }

    return id;
  },
  dismissToast: (id) => {
    clearToastTimer(id);
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) });
  },
  clearToasts: () => {
    if (typeof window !== "undefined") {
      for (const id of toastTimers.keys()) {
        clearToastTimer(id);
      }
    }

    set({ toasts: [] });
  },
}));

export const toast = {
  info: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().pushToast({ title, description, duration, variant: "info" }),
  success: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().pushToast({ title, description, duration, variant: "success" }),
  warning: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().pushToast({ title, description, duration, variant: "warning" }),
  error: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().pushToast({ title, description, duration, variant: "error" }),
  dismiss: (id: string) => useToastStore.getState().dismissToast(id),
  clear: () => useToastStore.getState().clearToasts(),
} as const;
