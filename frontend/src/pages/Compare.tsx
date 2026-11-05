import { useMemo, type ReactNode } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataBadge, Panel, SectionHead } from "@/components/atoms";
import { useCompare } from "@/lib/compare";
import { usePrograms } from "@/lib/queries";
import type { Program } from "@/lib/types";
import { CHART, fmtInt, fmtMillions, fmtMoney, fmtPct, fmtPower, tooltipStyle } from "@/lib/format";
import { cn } from "@/lib/utils";

const COLORS = [CHART.cyan, CHART.amber, CHART.emerald];

type MetricRow = { label: string; get: (p: Program) => number | null; fmt: (n: number) => ReactNode; better?: "high" | "low" };

const ROWS: MetricRow[] = [
  { label: "Total enrollment", get: (p) => p.total_enrollment, fmt: fmtInt, better: "high" },
  { label: "Undergraduate", get: (p) => p.ug_enrollment, fmt: fmtInt, better: "high" },
  { label: "Graduate", get: (p) => p.grad_enrollment, fmt: fmtInt, better: "high" },
  { label: "1-yr growth", get: (p) => p.growth_1y, fmt: (n) => fmtPct(n), better: "high" },
  { label: "5-yr growth", get: (p) => p.growth_5y, fmt: (n) => fmtPct(n), better: "high" },
  { label: "10-yr growth", get: (p) => p.growth_10y, fmt: (n) => fmtPct(n), better: "high" },
  { label: "Degrees / yr", get: (p) => p.annual_degrees, fmt: fmtInt, better: "high" },
  { label: "PhDs / yr", get: (p) => p.annual_phd, fmt: fmtInt, better: "high" },
  { label: "Est. yearly budget", get: (p) => p.budget_musd, fmt: fmtMillions, better: "high" },
  { label: "Research expenditure", get: (p) => p.research_expenditure_musd, fmt: fmtMillions, better: "high" },
  { label: "Job placement", get: (p) => p.placement_rate, fmt: (n) => `${n}%`, better: "high" },
  { label: "Median starting salary", get: (p) => p.median_starting_salary, fmt: fmtMoney, better: "high" },
  { label: "Students per faculty", get: (p) => p.students_per_faculty, fmt: (n) => n.toFixed(1), better: "low" },
  { label: "Tuition (out-of-state)", get: (p) => p.tuition_out_state, fmt: fmtMoney, better: "low" },
  { label: "US News rank", get: (p) => p.us_news_rank, fmt: (n) => `#${n}`, better: "low" },
  { label: "Reactor power", get: (p) => p.research_reactor?.power_kw ?? null, fmt: fmtPower, better: "high" },
];

export default function Compare() {
  const { data } = usePrograms();
  const { ids, toggle, remove } = useCompare();
  const all = data ?? [];
  const chosen = ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Program => !!p);
  const available = all.filter((p) => !ids.includes(p.id)).sort((a, b) => a.name.localeCompare(b.name));

  const enrollSeries = useMemo(() => {
    if (!chosen.length) return [];
    return chosen[0].enrollment_history.map((row, i) => {
      const o: Record<string, number> = { year: row.year };
      chosen.forEach((p) => (o[p.short_name] = p.enrollment_history[i].total));
      return o;
    });
  }, [chosen]);
  const gradSeries = useMemo(() => {
    if (!chosen.length) return [];
    return chosen[0].graduates_by_year.map((row, i) => {
      const o: Record<string, number> = { year: row.year };
      chosen.forEach((p) => (o[p.short_name] = p.graduates_by_year[i].total));
      return o;
    });
  }, [chosen]);

  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-20 pt-8 md:px-8">
      <SectionHead eyebrow="Side-by-side" title="Compare bench" right={<DataBadge kind="academic" />} />
      <p className="-mt-2 mb-6 max-w-2xl text-sm text-slate-400">Pick up to three programs. The strongest value in each row is highlighted.</p>

      <div className="grid gap-3 md:grid-cols-3" data-testid="compare-slots">
        {[0, 1, 2].map((slot) => {
          const p = chosen[slot];
          return (
            <Panel key={slot} className="flex min-h-28 flex-col justify-between p-4" testId={`compare-slot-${slot}`}>
              {p ? (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="mb-1 inline-block h-1 w-8 rounded" style={{ background: COLORS[slot] }} />
                      <div className="font-heading text-lg font-semibold text-slate-50">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.city}, {p.state}</div>
                    </div>
                    <button onClick={() => remove(p.id)} className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100" aria-label="Remove" data-testid={`compare-slot-remove-${slot}`}>
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 font-mono text-[11px] text-slate-500">{p.degrees.join(" · ")}</div>
                </>
              ) : (
                <Select value="" onValueChange={(v: string) => v && toggle(v)}>
                  <SelectTrigger className="w-full" data-testid={`compare-slot-select-${slot}`}>
                    <SelectValue>{() => "+ Add a program"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-[1300] max-h-80">
                    {available.map((a) => (
                      <SelectItem key={a.id} value={a.id} data-testid={`compare-option-${a.id}`}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Panel>
          );
        })}
      </div>

      {chosen.length > 0 ? (
        <>
          <div className="mt-6 rounded-xl border border-slate-800 bg-panel/90" data-testid="compare-table">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wider text-slate-500">Metric</TableHead>
                  {chosen.map((p, i) => (
                    <TableHead key={p.id} className="text-right text-xs" style={{ color: COLORS[i] }}>{p.short_name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROWS.map((r) => {
                  const vals = chosen.map((p) => r.get(p));
                  const nums = vals.filter((v): v is number => v !== null);
                  const best = nums.length > 1 ? (r.better === "low" ? Math.min(...nums) : Math.max(...nums)) : null;
                  return (
                    <TableRow key={r.label} className="border-slate-800/70">
                      <TableCell className="text-slate-400">{r.label}</TableCell>
                      {vals.map((v, i) => (
                        <TableCell key={chosen[i].id} className={cn("text-right font-mono", v !== null && v === best ? "text-cherenkov" : "text-slate-200")}>
                          {v === null ? "—" : r.fmt(v)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                <TableRow className="border-slate-800/70">
                  <TableCell className="text-slate-400">Research reactor</TableCell>
                  {chosen.map((p) => <TableCell key={p.id} className="text-right text-sm text-slate-200">{p.research_reactor?.name ?? "None"}</TableCell>)}
                </TableRow>
                <TableRow className="border-slate-800/70">
                  <TableCell className="text-slate-400">ABET accredited</TableCell>
                  {chosen.map((p) => <TableCell key={p.id} className="text-right text-sm text-slate-200">{p.abet_accredited ? "Yes" : "No"}</TableCell>)}
                </TableRow>
                <TableRow className="border-slate-800/70">
                  <TableCell className="text-slate-400">Research focus</TableCell>
                  {chosen.map((p) => <TableCell key={p.id} className="whitespace-normal text-right text-xs text-slate-300">{p.research_focus.join(", ")}</TableCell>)}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[{ title: "Enrollment trend", data: enrollSeries, id: "compare-chart-enrollment" }, { title: "Degrees awarded by year", data: gradSeries, id: "compare-chart-graduates" }].map((c) => (
              <Panel key={c.id} testId={c.id}>
                <h3 className="text-sm font-medium text-slate-300">{c.title}</h3>
                <div className="mt-3 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={c.data} margin={{ left: -10, right: 8, top: 6 }}>
                      <CartesianGrid stroke={CHART.grid} vertical={false} />
                      <XAxis dataKey="year" stroke={CHART.axis} fontSize={11} tickLine={false} />
                      <YAxis stroke={CHART.axis} fontSize={11} tickLine={false} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {chosen.map((p, i) => (
                        <Line key={p.id} type="monotone" dataKey={p.short_name} stroke={COLORS[i]} strokeWidth={2} dot={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            ))}
          </div>
        </>
      ) : (
        <Panel className="mt-6 text-sm text-slate-400" testId="compare-empty">
          No programs selected yet. Use the slots above, or press <span className="font-mono text-cherenkov">+</span> on any program in the Programs Atlas.
        </Panel>
      )}
    </main>
  );
}
