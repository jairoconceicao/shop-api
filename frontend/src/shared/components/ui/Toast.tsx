import { createPortal } from "react-dom";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { cn } from "@/shared/lib/cn";
import { toast, useToastStore, type ToastVariant } from "@/shared/state/useToastStore";

const variantStyles: Record<ToastVariant, { border: string; badge: string }> = {
  info: { border: "border-sky-200", badge: "info" },
  success: { border: "border-emerald-200", badge: "success" },
  warning: { border: "border-amber-200", badge: "warning" },
  error: { border: "border-red-200", badge: "danger" },
};

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0 || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed right-4 top-4 z-50 flex w-[min(100vw-2rem,24rem)] flex-col gap-3">
      {toasts.map((item) => {
        const styles = variantStyles[item.variant ?? "info"];

        return (
          <article
            key={item.id}
            className={cn(
              "rounded-3xl border bg-white p-4 shadow-xl shadow-spanish-green-950/10",
              styles.border,
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <Badge variant={styles.badge as "info" | "success" | "warning" | "danger"}>
                  {item.variant ?? "info"}
                </Badge>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-spanish-green-950">{item.title}</h3>
                  {item.description ? (
                    <p className="text-sm leading-6 text-spanish-green-700">{item.description}</p>
                  ) : null}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => dismissToast(item.id)} aria-label="Fechar toast">
                Fechar
              </Button>
            </div>
          </article>
        );
      })}
    </div>,
    document.body,
  );
}

export { toast };
