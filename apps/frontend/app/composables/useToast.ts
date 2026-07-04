export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

const toasts = ref<Toast[]>([]);

export function useToast() {
    function add(message: string, type: ToastType = "info", duration = 4000) {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        toasts.value.push({ id, type, message, duration });

        setTimeout(() => remove(id), duration);
    }

    function remove(id: string) {
        toasts.value = toasts.value.filter((t) => t.id !== id);
    }

    const success = (msg: string, duration?: number) => add(msg, "success", duration);
    const error = (msg: string, duration?: number) => add(msg, "error", duration);
    const info = (msg: string, duration?: number) => add(msg, "info", duration);
    const warning = (msg: string, duration?: number) => add(msg, "warning", duration);

    return { toasts: readonly(toasts), add, remove, success, error, info, warning };
}