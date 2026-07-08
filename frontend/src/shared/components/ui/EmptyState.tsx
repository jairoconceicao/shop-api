import type { ReactNode } from "react";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

type EmptyTone = "empty" | "error" | "success";

type EmptyAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent" | "outline";
};

type EmptyStateProps = {
  tone?: EmptyTone;
  title: string;
  description: string;
  action?: EmptyAction;
  secondaryAction?: EmptyAction;
  icon?: ReactNode;
};

const toneMeta: Record<EmptyTone, { badge: string; label: string }> = {
  empty: { badge: "Aguardando dados", label: "Sem resultados" },
  error: { badge: "Falha na carga", label: "Erro" },
  success: { badge: "Pronto", label: "Sucesso" },
};

export function EmptyState({
  tone = "empty",
  title,
  description,
  action,
  secondaryAction,
  icon,
}: EmptyStateProps) {
  const meta = toneMeta[tone];

  return (
    <Card role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"} className="border-dashed border-spanish-green-300 bg-spanish-green-50/70">
      <div className="flex flex-col items-start gap-5 p-6 sm:p-8">
        <Badge variant={tone === "error" ? "danger" : tone === "success" ? "success" : "neutral"}>
          {meta.badge}
        </Badge>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-spanish-green-950">{title}</h3>
            <p className="text-sm leading-6 text-spanish-green-700">{description}</p>
          </div>
          {icon ? <div className="text-spanish-green-500">{icon}</div> : null}
        </div>
        {action || secondaryAction ? (
          <div className="flex flex-wrap gap-3">
            {action ? (
              <Button variant={action.variant ?? "primary"} onClick={action.onClick}>
                {action.label}
              </Button>
            ) : null}
            {secondaryAction ? (
              <Button variant={secondaryAction.variant ?? "secondary"} onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
