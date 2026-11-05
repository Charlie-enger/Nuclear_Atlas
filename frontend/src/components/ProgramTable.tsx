import { useMemo, useState } from "react";
import { ArrowDownUp, Check, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GrowthValue } from "@/components/atoms";
import { useCompare } from "@/lib/compare";
import type { Program } from "@/lib/types";
import { fmtInt, fmtMillions } from "@/lib/format";
import { cn } from "@/lib/utils";

type Key = "short_name" | "state" | "total_enrollment" | "growth_1y" | "growth_5y" | "growth_10y" | "annual_degrees" | "budget_musd" | "placement_rate" | "us_news_rank";

const COLS: { key: Key; label: string; num?: boolean }[] = [
  { key: "short_name", label: "Program" },
  { key: "state", label: "State" },
  { key: "total_enrollment", label: "Enrolled", num: true },
  { key: "growth_1y", label: "1-yr", num: true },
  { key: "growth_5y", label: "5-yr", num: true },
  { key: "growth_10y", label: "10-yr", num: true },
  { key: "annual_degrees", label: "Degrees/yr", num: true },
  { key: "budget_musd", label: "Budget", num: true },
  { key: "placement_rate", label: "Placement", num: true },
  { key: "us_news_rank", label: "Rank", num: true },
];

export default function ProgramTable({ programs, onSelect }: { programs: Program[]; onSelect: (p: Program) => void }) {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "total_enrollment", dir: -1 });
  const compare = useCompare();
  const rows = useMemo(() => {
    return [...programs].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av === null) return 1;
      if (bv === null) return -1;
      return (av < bv ? -1 : av > bv ? 1 : 0) * sort.dir;
    });
  }, [programs, sort]);

  return (
    <div className="rounded-xl border border-slate-800 bg-panel/90" data-testid="programs-table">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            {COLS.map((c) => (
              <TableHead key={c.key} className={cn("text-[11px] uppercase tracking-wider text-slate-500", c.num && "text-right")}>
                <button
                  className={cn("inline-flex items-center gap-1 transition-colors hover:text-slate-200", sort.key === c.key && "text-cherenkov")}
                  onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key ? (s.dir === 1 ? -1 : 1) : c.num ? -1 : 1 }))}
                  data-testid={`table-sort-${c.key}`}
                >
                  {c.label}
                  <ArrowDownUp className="size-3" />
                </button>
              </TableHead>
            ))}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => (
            <TableRow
              key={p.id}
              className="cursor-pointer border-slate-800/70 transition-colors hover:bg-cyan-400/[0.04]"
              onClick={() => onSelect(p)}
              data-testid={`table-row-${p.id}`}
            >
              <TableCell className="font-medium text-slate-100">
                <div className="flex items-center gap-2">
                  {p.research_reactor && <span className="size-1.5 rounded-full bg-cherenkov" title="Research reactor" />}
                  {p.short_name}
                </div>
              </TableCell>
              <TableCell className="font-mono text-slate-400">{p.state}</TableCell>
              <TableCell className="text-right font-mono">{fmtInt(p.total_enrollment)}</TableCell>
              <TableCell className="text-right font-mono"><GrowthValue v={p.growth_1y} /></TableCell>
              <TableCell className="text-right font-mono"><GrowthValue v={p.growth_5y} /></TableCell>
              <TableCell className="text-right font-mono"><GrowthValue v={p.growth_10y} /></TableCell>
              <TableCell className="text-right font-mono">{p.annual_degrees}</TableCell>
              <TableCell className="text-right font-mono">{fmtMillions(p.budget_musd)}</TableCell>
              <TableCell className="text-right font-mono">{p.placement_rate}%</TableCell>
              <TableCell className="text-right font-mono text-amber-200">{p.us_news_rank ? `#${p.us_news_rank}` : "—"}</TableCell>
              <TableCell>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    compare.toggle(p.id);
                  }}
                  className={cn(
                    "grid size-7 place-items-center rounded-md border transition-colors",
                    compare.has(p.id) ? "border-cyan-400/50 bg-cyan-400/15 text-cherenkov" : "border-slate-700 text-slate-400 hover:text-slate-100",
                  )}
                  aria-label="Toggle compare"
                  data-testid={`table-compare-${p.id}`}
                >
                  {compare.has(p.id) ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
