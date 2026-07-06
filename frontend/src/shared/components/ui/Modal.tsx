import type { ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/cn";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "accent";
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  footer,
  size = "md",
  tone = "default",
}: ModalProps) {
  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-spanish-green-950/55 px-4 py-6 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className={cn(
          "w-full overflow-hidden rounded-[2rem] border border-spanish-green-200 bg-white shadow-2xl shadow-spanish-green-950/20",
          sizeClasses[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-spanish-green-200 px-6 py-5">
          <div className="space-y-2">
            <Badge variant={tone === "accent" ? "info" : "neutral"}>Modal</Badge>
            <h2 id="modal-title" className="text-2xl font-semibold tracking-tight text-spanish-green-950">
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="text-sm leading-6 text-spanish-green-700">
                {description}
              </p>
            ) : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar modal">
            Fechar
          </Button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer ? (
          <div className="flex flex-wrap justify-end gap-3 border-t border-spanish-green-200 bg-spanish-green-50/60 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
