import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DataKind = "federal" | "academic" | "estimate" | "derived";

const KIND: Record<DataKind, { label: string; cls: string }> = {
  federal: { label: "Verified Federal (BLS)", cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" },
  academic: { label: "ORISE / IPEDS calibrated", cls: "border-cyan-400/30 bg-cyan-950 text-cyan-300" },
  estimate: { label: "Institution estimate", cls: "border-amber-400/30 bg-amber-950 text-amber-200" },
  derived: { label: "Derived estimate", cls: "border-slate-500/40 bg-slate-800 text-slate-300" },
};

export function DataBadge({ kind, className }: { kind: DataKind; className?: string }) {
  const k = KIND[kind];
  return (
    <span
      className={cn("inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", k.cls, className)}
      data-testid={`data-badge-${kind}`}
    >
      {k.label}
    </span>
  );
}

export function StatTile({
  label,
  value,
  sub,
  accent = "cyan",
  testId,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: "cyan" | "amber" | "emerald" | "sky";
  testId: string;
}) {
  const bar = { cyan: "bg-cherenkov", amber: "bg-amber-atomic", emerald: "bg-emerald-400", sky: "bg-sky-400" }[accent];
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-panel/80 px-4 py-3" data-testid={testId}>
      <span className={cn("absolute inset-y-0 left-0 w-0.5", bar)} />
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-2xl font-medium text-slate-50">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

export function SectionHead({ eyebrow, title, right }: { eyebrow: string; title: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cherenkov/80">{eyebrow}</div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-slate-50">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function Panel({ children, className, testId }: { children: ReactNode; className?: string; testId?: string }) {
  return (
    <section className={cn("rounded-xl border border-slate-800 bg-panel/90 p-5", className)} data-testid={testId}>
      {children}
    </section>
  );
}

export function GrowthValue({ v }: { v: number }) {
  return <span className={v > 0 ? "text-emerald-400" : v < 0 ? "text-rose-400" : "text-slate-300"}>{`${v > 0 ? "+" : ""}${v.toFixed(1)}%`}</span>;
}
