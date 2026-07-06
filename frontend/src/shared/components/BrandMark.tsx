import { env } from "@/config/env";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-spanish-green-600 text-sm font-semibold text-white shadow-lg shadow-spanish-green-950/20">
        SA
      </div>
      <div>
        <p className="text-sm font-semibold tracking-wide text-spanish-green-950">
          {env.appName}
        </p>
        <p className="text-xs text-spanish-green-600">SPA de e-commerce</p>
      </div>
    </div>
  );
}
