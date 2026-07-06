import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("block animate-pulse rounded-2xl bg-spanish-green-200/80", className)} aria-hidden="true" {...props} />;
}
