import { env } from "@/config/env";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4b5d48,#262c21)] text-sm font-semibold text-white shadow-lg shadow-spanish-green-950/20 ring-1 ring-white/30">
        SA
      </div>
      <div>
        <p className="text-sm font-semibold tracking-wide text-spanish-green-950">{env.appName}</p>
        <p className="text-xs text-spanish-green-600">Loja comercial para descoberta e compra</p>
      </div>
    </div>
  );
}
