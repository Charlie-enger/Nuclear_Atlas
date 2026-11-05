import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProgramsMap, { programColor } from "@/components/ProgramsMap";
import ProgramDetail from "@/components/ProgramDetail";
import ProgramTable from "@/components/ProgramTable";
import { DataBadge, GrowthValue, Panel, SectionHead, StatTile } from "@/components/atoms";
import { usePrograms, useProgramsSummary } from "@/lib/queries";
import type { Program } from "@/lib/types";
import { CHART, fmtInt, fmtMillions, fmtPct, tooltipStyle } from "@/lib/format";
import { cn } from "@/lib/utils";

const REGIONS = ["All", "Northeast", "Southeast", "Midwest", "Southwest", "West"];

function FilterCheck({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} data-testid={`filter-${id}`} />
      {label}
    </label>
  );
}

export default function Programs() {
  const programs = usePrograms();
  const summary = useProgramsSummary();
  const [selected, setSelected] = useState<Program | null>(null);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All");
  const [reactorOnly, setReactorOnly] = useState(false);
  const [abetOnly, setAbetOnly] = useState(false);
  const [ugOnly, setUgOnly] = useState(false);

  const filtered = useMemo(() => {
    const all = programs.isError ? [] : (programs.data ?? []);
    const term = q.trim().toLowerCase();
    return all.filter(
      (p) =>
        (!term || `${p.name} ${p.short_name} ${p.city} ${p.state} ${p.research_focus.join(" ")}`.toLowerCase().includes(term)) &&
        (region === "All" || p.region === region) &&
        (!reactorOnly || !!p.research_reactor) &&
        (!abetOnly || p.abet_accredited) &&
        (!ugOnly || p.ug_enrollment > 0),
    );
  }, [programs.data, programs.isError, q, region, reactorOnly, abetOnly, ugOnly]);

  const s = summary.isError ? undefined : summary.data;
  const budgetTop = useMemo(
    () => [...filtered].sort((a, b) => b.budget_musd - a.budget_musd).slice(0, 12).map((p) => ({ name: p.short_name, budget: p.budget_musd, research: p.research_expenditure_musd })),
    [filtered],
  );

  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-8 md:px-8">
      {/* Hero */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-end">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-cherenkov/80">Academic pipeline · AY 2023–24</div>
          <h1 className="mt-2 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-slate-50 md:text-5xl">
            Every US nuclear engineering program, <span className="text-cherenkov">mapped.</span>
          </h1>
          <p className="mt-3 max-w-xl text-slate-400">
            Enrollment, 1/5/10-year growth, graduates by year, budgets, placement and research reactors for {s?.program_count ?? "30+"} programs —
            cross-referenced with ORISE national totals and live BLS labor data.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" data-testid="programs-summary-stats">
          <StatTile testId="stat-program-count" label="Programs" value={s?.program_count ?? "—"} sub={s ? `${s.states_count} states` : undefined} />
          <StatTile testId="stat-total-enrollment" label="Students enrolled" value={fmtInt(s?.total_enrollment)} sub={s ? `${fmtInt(s.ug_enrollment)} UG · ${fmtInt(s.grad_enrollment)} grad` : undefined} accent="sky" />
          <StatTile testId="stat-annual-degrees" label="Degrees / year" value={s ? fmtInt(s.annual_bs + s.annual_ms + s.annual_phd) : "—"} sub={s ? `${s.annual_bs} BS · ${s.annual_ms} MS · ${s.annual_phd} PhD` : undefined} accent="amber" />
          <StatTile testId="stat-research-reactors" label="Campus reactors" value={s?.research_reactors ?? "—"} sub="Operating / licensed" />
          <StatTile testId="stat-avg-growth" label="Avg 5-yr growth" value={s ? fmtPct(s.avg_growth_5y) : "—"} accent="emerald" />
          <StatTile testId="stat-total-budget" label="Combined budget" value={s ? fmtMillions(s.total_budget_musd) : "—"} sub="Est. dept. + research" accent="amber" />
        </div>
      </div>

      {/* Map + list */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="h-[460px] overflow-hidden rounded-xl border border-slate-800 lg:h-[600px]">
          <ProgramsMap programs={filtered} selected={selected} onSelect={setSelected} />
        </div>
        <Panel className="flex h-[600px] flex-col p-0" testId="programs-list-panel">
          <div className="space-y-3 border-b border-slate-800 p-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search school, city, research focus…" className="pl-8" data-testid="programs-search-input" />
            </div>
            <Select value={region} onValueChange={(v: string) => setRegion(v)}>
              <SelectTrigger className="w-full" data-testid="filter-region-select">
                <SelectValue>{(v) => (v === "All" ? "All regions" : (v as string))}</SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[1300]">
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r} data-testid={`filter-region-${r.toLowerCase()}`}>{r === "All" ? "All regions" : r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <FilterCheck id="has-reactor" label="Research reactor" checked={reactorOnly} onChange={setReactorOnly} />
              <FilterCheck id="abet" label="ABET" checked={abetOnly} onChange={setAbetOnly} />
              <FilterCheck id="undergrad" label="Offers undergrad" checked={ugOnly} onChange={setUgOnly} />
            </div>
            <div className="font-mono text-[11px] text-slate-500" data-testid="programs-result-count">{filtered.length} programs shown</div>
          </div>
          <ul className="flex-1 overflow-y-auto p-2" data-testid="programs-list">
            {programs.isLoading && <li className="p-4 text-sm text-slate-500">Loading programs…</li>}
            {programs.isError && <li className="p-4 text-sm text-slate-500">Program data is unavailable right now.</li>}
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setSelected(p)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-slate-800/60",
                    selected?.id === p.id && "bg-cyan-400/[0.07]",
                  )}
                  data-testid={`program-list-item-${p.id}`}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: programColor(p) }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-100">{p.name}</span>
                    <span className="block truncate text-xs text-slate-500">{p.city}, {p.state} · {fmtInt(p.total_enrollment)} students</span>
                  </span>
                  <span className="text-right font-mono text-xs">
                    <GrowthValue v={p.growth_5y} />
                    <span className="block text-[10px] text-slate-600">5-yr</span>
                  </span>
                </button>
              </li>
            ))}
            {!programs.isLoading && filtered.length === 0 && !programs.isError && (
              <li className="p-4 text-sm text-slate-500" data-testid="programs-empty">No programs match these filters.</li>
            )}
          </ul>
        </Panel>
      </div>

      {/* Analytics */}
      <div className="mt-12">
        <SectionHead eyebrow="National trendlines" title="Pipeline analytics" right={<DataBadge kind="academic" />} />
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel testId="chart-national-enrollment">
            <h3 className="text-sm font-medium text-slate-300">Total enrollment, tracked programs</h3>
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={s?.enrollment_by_year ?? []} margin={{ left: -10, right: 6, top: 6 }}>
                  <defs>
                    <linearGradient id="natEnr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.cyan} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHART.cyan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="year" stroke={CHART.axis} fontSize={11} tickLine={false} />
                  <YAxis stroke={CHART.axis} fontSize={11} tickLine={false} domain={["dataMin - 300", "auto"]} />
                  <Tooltip {...tooltipStyle} />
                  <Area dataKey="total" name="Students" stroke={CHART.cyan} fill="url(#natEnr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel testId="chart-national-graduates">
            <h3 className="text-sm font-medium text-slate-300">Degrees awarded by year</h3>
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s?.graduates_by_year ?? []} margin={{ left: -10, right: 6, top: 6 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="year" stroke={CHART.axis} fontSize={11} tickLine={false} />
                  <YAxis stroke={CHART.axis} fontSize={11} tickLine={false} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(56,189,248,0.06)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="bs" name="BS" stackId="d" fill={CHART.sky} />
                  <Bar dataKey="ms" name="MS" stackId="d" fill={CHART.cyan} />
                  <Bar dataKey="phd" name="PhD" stackId="d" fill={CHART.amber} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {s && (
              <p className="mt-2 text-[11px] text-slate-500">
                ORISE {s.orise_reference.year} national reference: {s.orise_reference.bs} BS · {s.orise_reference.ms} MS · {s.orise_reference.phd} PhD.
              </p>
            )}
          </Panel>
          <Panel testId="chart-budget-distribution">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-300">Est. yearly budget — top 12 ($M)</h3>
              <DataBadge kind="estimate" />
            </div>
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetTop} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid stroke={CHART.grid} horizontal={false} />
                  <XAxis type="number" stroke={CHART.axis} fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke={CHART.axis} fontSize={10} width={86} tickLine={false} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(56,189,248,0.06)" }} />
                  <Bar dataKey="research" name="Research exp." fill={CHART.cyan} />
                  <Bar dataKey="budget" name="Total budget" fill={CHART.amber} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>

      {/* Table */}
      <div className="mt-12">
        <SectionHead eyebrow="Sortable index" title="All programs" right={<span className="text-xs text-slate-500">Click a row for full profile · + to compare</span>} />
        <ProgramTable programs={filtered} onSelect={setSelected} />
      </div>

      <ProgramDetail program={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
