import { useMemo, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ExternalLink, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import JobsMap, { METRICS, METRO_METRICS, TRAINING_COLORS, type JobMetric, type MapView, type MetroMetric } from "@/components/JobsMap";
import { DataBadge, Panel, SectionHead, StatTile } from "@/components/atoms";
import { usePrograms, useRefreshWorkforce, useWorkforce } from "@/lib/queries";
import { CHART, fmtInt, fmtMoney, tooltipStyle } from "@/lib/format";
import { cn } from "@/lib/utils";

function Row({ label, value, testId }: { label: string; value: ReactNode; testId: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-800/70 py-1.5 text-sm last:border-0" data-testid={testId}>
      <span className="text-slate-400">{label}</span>
      <span className="font-mono text-slate-100">{value}</span>
    </div>
  );
}

export default function Workforce() {
  const wf = useWorkforce();
  const programs = usePrograms();
  const refresh = useRefreshWorkforce();
  const [metric, setMetric] = useState<JobMetric>("eng_emp");
  const [metroMetric, setMetroMetric] = useState<MetroMetric>("m_eng_emp");
  const [view, setView] = useState<MapView>("states");
  const [showEmployers, setShowEmployers] = useState(true);
  const [showTraining, setShowTraining] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedMetro, setSelectedMetro] = useState<string | null>(null);

  const d = wf.isError ? undefined : wf.data;
  const states = d?.states ?? [];
  const metros = d?.metros ?? [];
  const training = d?.training_sites ?? [];
  const ranked = useMemo(
    () => [...states].sort((a, b) => (b.engineers.employment ?? -1) - (a.engineers.employment ?? -1)),
    [states],
  );
  const metroRanked = useMemo(
    () => [...metros].sort((a, b) => (b.ne_location_quotient ?? -1) - (a.ne_location_quotient ?? -1) || (b.ne_employment ?? -1) - (a.ne_employment ?? -1)),
    [metros],
  );
  const selMetro = metros.find((m) => m.code === (selectedMetro ?? metroRanked[0]?.code)) ?? null;
  const sel = states.find((s) => s.code === (selectedCode ?? ranked[0]?.code)) ?? null;
  const selTraining = training.filter((t) => t.state === sel?.code);
  const tp = d?.technician_pipeline;
  const selEmployers = d?.employers.filter((e) => e.state === sel?.code) ?? [];
  const selPrograms = (programs.data ?? []).filter((p) => p.state === sel?.code);
  const eng = d?.projections.find((p) => p.key === "engineers");
  const tech = d?.projections.find((p) => p.key === "technicians");

  const gapData = d
    ? [
        { name: "NE degrees / yr", value: d.pipeline.annual_degrees, kind: "supply" },
        { name: "BS only", value: d.pipeline.annual_bs, kind: "supply2" },
        ...d.scenarios.map((s) => ({ name: s.name, value: s.annual_engineer_need, kind: s.key })),
      ]
    : [];
  const gapColor = (k: string) => (k === "supply" ? CHART.sky : k === "supply2" ? "#1E6A8F" : k === "bls" ? CHART.cyan : k === "restarts" ? CHART.amber : CHART.rose);

  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-8 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-end">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-amber-300/90">SOC 17-2161 · SOC 19-4051</div>
          <h1 className="mt-2 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-slate-50 md:text-5xl">
            Where the nuclear <span className="text-amber-atomic">jobs</span> are.
          </h1>
          <p className="mt-3 max-w-xl text-slate-400">
            State-level employment and wages for nuclear engineers and nuclear technicians from the U.S. Bureau of Labor Statistics (OEWS), with
            10-year projections and how many new graduates the industry needs.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={() => refresh.mutate()} disabled={refresh.isPending} data-testid="bls-refresh-button">
              <RefreshCw className={cn("size-4", refresh.isPending && "animate-spin")} />
              {refresh.isPending ? "Contacting BLS…" : "Refresh from BLS API"}
            </Button>
            <span className="font-mono text-[11px] text-slate-500" data-testid="bls-fetched-at">
              {d ? `${d.is_live_cache ? "Live cache" : "Bundled snapshot"} · fetched ${new Date(d.fetched_at).toLocaleString()}` : "BLS data unavailable"}
            </span>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" data-testid="workforce-national-stats">
          <StatTile testId="stat-ne-employment" label="Nuclear engineers" value={fmtInt(d?.national.engineers.employment)} sub={`OEWS May ${d?.data_year ?? ""} · employed`} />
          <StatTile testId="stat-ne-median-wage" label="Engineer median wage" value={fmtMoney(d?.national.engineers.median_wage)} sub={`mean ${fmtMoney(d?.national.engineers.mean_wage)}`} accent="emerald" />
          <StatTile testId="stat-ne-openings" label="Engineer openings / yr" value={fmtInt(eng?.annual_openings)} sub={eng ? `${eng.pct_change}% growth 2024–34` : undefined} accent="sky" />
          <StatTile testId="stat-tech-employment" label="Nuclear technicians" value={fmtInt(d?.national.technicians.employment)} sub="employed" accent="amber" />
          <StatTile testId="stat-tech-median-wage" label="Technician median wage" value={fmtMoney(d?.national.technicians.median_wage)} sub={`mean ${fmtMoney(d?.national.technicians.mean_wage)}`} accent="emerald" />
          <StatTile testId="stat-tech-openings" label="Technician openings / yr" value={fmtInt(tech?.annual_openings)} sub={tech ? `${tech.pct_change}% growth 2024–34` : undefined} accent="amber" />
        </div>
      </div>

      {/* Map + state panel */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-panel/90">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 p-3">
            <div className="flex rounded-md border border-slate-700 p-0.5" data-testid="jobs-view-toggle">
              {(["states", "metros"] as MapView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "rounded px-3 py-1 text-xs transition-colors duration-150",
                    view === v ? "bg-cyan-400/15 text-cherenkov" : "text-slate-400 hover:text-slate-100",
                  )}
                  data-testid={`jobs-view-${v}`}
                >
                  {v === "states" ? "States" : "Metro hotspots"}
                </button>
              ))}
            </div>
            {view === "states" ? (
              <Select key="state-metric" value={metric} onValueChange={(v: string) => setMetric(v as JobMetric)}>
                <SelectTrigger className="w-72" data-testid="jobs-metric-select">
                  <SelectValue>{(v) => METRICS[v as JobMetric]?.label ?? ""}</SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[1300]">
                  {(Object.keys(METRICS) as JobMetric[]).map((k) => (
                    <SelectItem key={k} value={k} data-testid={`jobs-metric-${k}`}>{METRICS[k].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select key="metro-metric" value={metroMetric} onValueChange={(v: string) => setMetroMetric(v as MetroMetric)}>
                <SelectTrigger className="w-72" data-testid="jobs-metro-metric-select">
                  <SelectValue>{(v) => METRO_METRICS[v as MetroMetric]?.label ?? ""}</SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[1300]">
                  {(Object.keys(METRO_METRICS) as MetroMetric[]).map((k) => (
                    <SelectItem key={k} value={k} data-testid={`jobs-metro-metric-${k}`}>{METRO_METRICS[k].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
              <Checkbox checked={showEmployers} onCheckedChange={(v) => setShowEmployers(!!v)} data-testid="jobs-toggle-employers" />
              Labs, vendors & utilities
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
              <Checkbox checked={showTraining} onCheckedChange={(v) => setShowTraining(!!v)} data-testid="jobs-toggle-training" />
              Technician training sites
            </label>
            <DataBadge kind={view === "states" && metric === "balance" ? "derived" : "federal"} className="ml-auto" />
          </div>
          <div className="h-[460px] lg:h-[560px]">
            <JobsMap
              view={view}
              states={states}
              metros={metros}
              employers={d?.employers ?? []}
              training={training}
              metric={metric}
              metroMetric={metroMetric}
              showEmployers={showEmployers}
              showTraining={showTraining}
              selected={view === "states" ? (sel?.code ?? null) : (selMetro?.code ?? null)}
              onSelect={view === "states" ? setSelectedCode : setSelectedMetro}
            />
          </div>
        </div>

        <Panel className="h-fit lg:h-[617px] lg:overflow-y-auto" testId="state-detail-panel">
          {view === "metros" && selMetro ? (
            <div data-testid="metro-detail">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Metro hotspot</div>
              <h3 className="font-heading text-2xl font-semibold text-slate-50" data-testid="metro-detail-name">{selMetro.name}</h3>
              {selMetro.anchor && <p className="mt-1 text-sm text-cyan-200" data-testid="metro-detail-anchor">{selMetro.anchor}</p>}
              <div className="mt-3">
                <Row label="Nuclear engineers employed" value={selMetro.ne_employment !== null ? fmtInt(selMetro.ne_employment) : "suppressed"} testId="metro-ne-employment" />
                <Row
                  label="Concentration vs US average"
                  value={selMetro.ne_location_quotient !== null ? <span className="text-pink-300">{selMetro.ne_location_quotient.toFixed(2)}×</span> : "—"}
                  testId="metro-ne-lq"
                />
                <Row label="Engineer mean wage" value={selMetro.ne_mean_wage !== null ? fmtMoney(selMetro.ne_mean_wage) : "—"} testId="metro-ne-wage" />
                <Row label="Nuclear technicians employed" value={selMetro.tech_employment !== null ? fmtInt(selMetro.tech_employment) : "suppressed"} testId="metro-tech-employment" />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                Location quotient = the metro's share of jobs in nuclear engineering ÷ the national share. 18× means nuclear engineers are 18 times more concentrated than
                in the US overall. {selMetro.suppressed && "BLS withholds this metro's employment count (small sample or confidentiality) even though it is a known nuclear hub."}
              </p>
            </div>
          ) : sel ? (
            <>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">State profile</div>
              <h3 className="font-heading text-2xl font-semibold text-slate-50" data-testid="state-detail-name">{sel.name}</h3>
              <div className="mt-3">
                <Row label="Nuclear engineers employed" value={sel.engineers.employment !== null ? fmtInt(sel.engineers.employment) : "suppressed"} testId="state-ne-employment" />
                <Row label="Engineer mean wage" value={sel.engineers.mean_wage !== null ? fmtMoney(sel.engineers.mean_wage) : "—"} testId="state-ne-wage" />
                <Row label="Nuclear technicians employed" value={sel.technicians.employment !== null ? fmtInt(sel.technicians.employment) : "suppressed"} testId="state-tech-employment" />
                <Row label="Technician mean wage" value={sel.technicians.mean_wage !== null ? fmtMoney(sel.technicians.mean_wage) : "—"} testId="state-tech-wage" />
                <Row label="Operating power reactors" value={sel.operating_reactors} testId="state-reactors" />
                <Row label="NE programs in state" value={sel.programs_count} testId="state-programs" />
                <Row label="NE degrees / yr (state)" value={sel.annual_ne_degrees} testId="state-degrees" />
                <Row label="Est. engineer openings / yr" value={sel.est_engineer_openings ?? "—"} testId="state-eng-openings" />
                <Row label="Est. technician openings / yr" value={sel.est_technician_openings ?? "—"} testId="state-tech-openings" />
                <Row
                  label="Local grad supply balance"
                  value={
                    sel.supply_balance === null ? "—" : (
                      <span className={sel.supply_balance >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {sel.supply_balance > 0 ? "+" : ""}{sel.supply_balance}/yr
                      </span>
                    )
                  }
                  testId="state-supply-balance"
                />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                Openings = state employment × national BLS openings rate. Negative balance = state imports talent. BLS suppresses estimates where samples are small.
              </p>
              {selPrograms.length > 0 && (
                <div className="mt-4">
                  <div className="mb-1.5 text-xs uppercase tracking-wider text-slate-500">Programs</div>
                  <ul className="space-y-1 text-sm text-slate-200">{selPrograms.map((p) => <li key={p.id}>· {p.name}</li>)}</ul>
                </div>
              )}
              {selEmployers.length > 0 && (
                <div className="mt-4">
                  <div className="mb-1.5 text-xs uppercase tracking-wider text-slate-500">Major employers</div>
                  <ul className="space-y-2" data-testid="state-employers">
                    {selEmployers.map((e) => (
                      <li key={e.name} className="rounded-md border border-slate-800 bg-subtle/40 px-2.5 py-1.5">
                        <div className="text-sm text-slate-100">{e.name}</div>
                        <div className="text-[11px] text-slate-400">{e.type} · {e.focus}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selTraining.length > 0 && (
                <div className="mt-4">
                  <div className="mb-1.5 text-xs uppercase tracking-wider text-slate-500">Technician training</div>
                  <ul className="space-y-2" data-testid="state-training-sites">
                    {selTraining.map((t) => (
                      <li key={t.id} className="rounded-md border border-lime-400/20 bg-lime-950/20 px-2.5 py-1.5">
                        <div className="text-sm text-slate-100">{t.name}</div>
                        <div className="text-[11px] text-slate-400">{t.credentials.join(" · ")}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-slate-500">Workforce data unavailable right now.</div>
          )}
        </Panel>
      </div>

      {/* Projections */}
      <div className="mt-12">
        <SectionHead eyebrow="BLS Employment Projections 2024–34" title="10-year outlook" right={<DataBadge kind="federal" />} />
        <div className="grid gap-4 md:grid-cols-2">
          {d?.projections.map((p) => (
            <Panel key={p.key} testId={`projection-card-${p.key}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[11px] text-slate-500">SOC {p.soc}</div>
                  <h3 className="font-heading text-xl font-semibold text-slate-50">{p.occupation}</h3>
                </div>
                <span className={cn("flex items-center gap-1 rounded-md px-2 py-1 font-mono text-sm", p.pct_change >= 0 ? "bg-emerald-950 text-emerald-300" : "bg-rose-950 text-rose-300")}>
                  {p.pct_change >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  {p.pct_change > 0 ? "+" : ""}{p.pct_change}%
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">{p.base_year}</div>
                  <div className="font-mono text-xl text-slate-100">{fmtInt(p.base_employment)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">{p.projected_year}</div>
                  <div className="font-mono text-xl text-slate-100">{fmtInt(p.projected_employment)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">Openings/yr</div>
                  <div className="font-mono text-xl text-cherenkov">{fmtInt(p.annual_openings)}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Despite flat/declining headcount, ~{p.annual_openings} openings arise each year — nearly all from retirements and transfers. Typical entry: {p.typical_education}.
              </p>
              <a href={p.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-sky-400 hover:underline" data-testid={`projection-source-${p.key}`}>
                BLS Occupational Outlook <ExternalLink className="size-3" />
              </a>
            </Panel>
          ))}
        </div>
      </div>

      {/* Supply vs demand */}
      <div className="mt-12">
        <SectionHead eyebrow="New graduates necessary" title="Graduate supply vs. demand scenarios" right={<DataBadge kind="derived" />} />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Panel testId="chart-supply-demand">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gapData} margin={{ left: -8, right: 8, top: 10 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={CHART.axis} fontSize={10} tickLine={false} interval={0} />
                  <YAxis stroke={CHART.axis} fontSize={11} tickLine={false} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(56,189,248,0.06)" }} />
                  {d && <ReferenceLine y={d.pipeline.annual_degrees} stroke={CHART.sky} strokeDasharray="4 4" />}
                  <Bar dataKey="value" name="Per year" radius={[4, 4, 0, 0]}>
                    {gapData.map((g) => <Cell key={g.name} fill={gapColor(g.kind)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Dashed line = all NE degrees awarded per year by tracked programs. Only part of each class enters the nuclear workforce (many BS grads continue to graduate school,
              and some go to other industries), while ME, EE and physics graduates also fill nuclear-engineer roles.
            </p>
          </Panel>
          <div className="space-y-3" data-testid="scenario-list">
            {d?.scenarios.map((s) => (
              <Panel key={s.key} className="p-4" testId={`scenario-${s.key}`}>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-heading font-semibold text-slate-100">{s.name}</h4>
                  <span className="font-mono text-sm text-cherenkov">{fmtInt(s.annual_engineer_need)}/yr</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{s.description}</p>
                <div className="mt-2 font-mono text-xs">
                  {s.annual_gap > 0 ? (
                    <span className="text-rose-400">Shortfall vs. all NE degrees: {fmtInt(s.annual_gap)} grads/yr</span>
                  ) : (
                    <span className="text-emerald-400">Covered on paper (surplus {fmtInt(-s.annual_gap)}) — but only if most graduates enter the industry</span>
                  )}
                </div>
              </Panel>
            ))}
            {tp && (
              <Panel className="p-4" testId="technician-pipeline-note">
                <h4 className="font-heading font-semibold text-slate-100">Technician pipeline</h4>
                <p className="mt-1 text-xs text-slate-400">
                  ~{tp.annual_technician_openings} technician openings/yr are filled mainly by two-year nuclear technology colleges (~{fmtInt(tp.civilian_annual_completers)} completers/yr)
                  and Navy nuclear veterans — see the training pipeline below.
                </p>
              </Panel>
            )}
          </div>
        </div>
      </div>

      {/* Metro hotspots */}
      <div className="mt-12">
        <SectionHead
          eyebrow={`BLS OEWS metro areas · May ${d?.data_year ?? ""}`}
          title="Metro hotspots for nuclear engineers"
          right={<DataBadge kind="federal" />}
        />
        <div className="rounded-xl border border-slate-800 bg-panel/90" data-testid="metro-ranking-table">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                {["Metro area", "What's there", "Engineers", "Concentration", "Eng. mean wage", "Technicians"].map((h, i) => (
                  <TableHead key={h} className={cn("text-[11px] uppercase tracking-wider text-slate-500", i > 1 && "text-right")}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metroRanked.map((m) => (
                <TableRow
                  key={m.code}
                  onClick={() => {
                    setView("metros");
                    setSelectedMetro(m.code);
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className={cn("cursor-pointer border-slate-800/70 transition-colors hover:bg-cyan-400/[0.04]", view === "metros" && selMetro?.code === m.code && "bg-cyan-400/[0.06]")}
                  data-testid={`metro-row-${m.code}`}
                >
                  <TableCell className="font-medium text-slate-100">{m.name}</TableCell>
                  <TableCell className="max-w-80 whitespace-normal text-xs text-slate-400">{m.anchor ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono">{m.ne_employment !== null ? fmtInt(m.ne_employment) : <span className="text-slate-500">suppressed</span>}</TableCell>
                  <TableCell className="text-right font-mono text-pink-300">{m.ne_location_quotient !== null ? `${m.ne_location_quotient.toFixed(1)}×` : "—"}</TableCell>
                  <TableCell className="text-right font-mono">{fmtMoney(m.ne_mean_wage)}</TableCell>
                  <TableCell className="text-right font-mono">{fmtInt(m.tech_employment)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Only metros where BLS publishes at least one value are listed, plus known hubs it suppresses. Oak Ridge (ORNL) sits inside the Knoxville metro; Los Alamos falls
          outside any metro, so Santa Fe is shown as its proxy.
        </p>
      </div>

      {/* Technician training pipeline */}
      <div className="mt-12">
        <SectionHead eyebrow="Technician supply" title="Two-year programs & Navy nuclear training" right={<DataBadge kind="estimate" />} />
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4" data-testid="technician-pipeline-stats">
          <StatTile testId="stat-tech-sites" label="Training sites mapped" value={tp?.site_count ?? "—"} accent="emerald" />
          <StatTile testId="stat-tech-civilian" label="College completers / yr" value={tp ? `~${fmtInt(tp.civilian_annual_completers)}` : "—"} sub="AAS / certificates (est.)" accent="emerald" />
          <StatTile testId="stat-tech-navy" label="Navy nuclear trainees / yr" value={tp ? `~${fmtInt(tp.navy_annual_trainees)}` : "—"} sub="many join civilian plants after service" accent="sky" />
          <StatTile testId="stat-tech-openings-vs" label="Technician openings / yr" value={fmtInt(tp?.annual_technician_openings)} sub="BLS 2024–34" accent="amber" />
        </div>
        <div className="mt-4 rounded-xl border border-slate-800 bg-panel/90" data-testid="training-sites-table">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                {["Site", "Type", "Location", "Credentials", "Partner plants / employers", "Completers/yr"].map((h, i) => (
                  <TableHead key={h} className={cn("text-[11px] uppercase tracking-wider text-slate-500", i === 5 && "text-right")}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {training.map((t) => (
                <TableRow key={t.id} className="border-slate-800/70" data-testid={`training-row-${t.id}`}>
                  <TableCell className="whitespace-normal font-medium text-slate-100">
                    <a href={t.website} target="_blank" rel="noreferrer" className="hover:text-sky-400 hover:underline">{t.name}</a>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                      <span className="size-2 rounded-full" style={{ background: TRAINING_COLORS[t.type] }} />
                      {t.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">{t.city}, {t.state}</TableCell>
                  <TableCell className="max-w-72 whitespace-normal text-xs text-slate-300">{t.credentials.join(" · ")}</TableCell>
                  <TableCell className="max-w-64 whitespace-normal text-xs text-slate-400">{t.partners.join(", ")}</TableCell>
                  <TableCell className="text-right font-mono">{t.annual_completers ? `~${fmtInt(t.annual_completers)}` : <span className="text-xs text-slate-500">in Navy pipeline</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* State ranking */}
      <div className="mt-12">
        <SectionHead eyebrow={`BLS OEWS May ${d?.data_year ?? ""}`} title="States ranked by nuclear engineering employment" />
        <div className="rounded-xl border border-slate-800 bg-panel/90" data-testid="state-ranking-table">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                {["State", "Engineers", "Eng. mean wage", "Technicians", "Tech. mean wage", "Reactors", "NE degrees/yr", "Supply balance"].map((h, i) => (
                  <TableHead key={h} className={cn("text-[11px] uppercase tracking-wider text-slate-500", i > 0 && "text-right")}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked
                .filter((s) => s.engineers.employment !== null || s.technicians.employment !== null || s.operating_reactors > 0 || s.programs_count > 0)
                .map((s) => (
                  <TableRow
                    key={s.code}
                    onClick={() => {
                      setSelectedCode(s.code);
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    className={cn("cursor-pointer border-slate-800/70 transition-colors hover:bg-cyan-400/[0.04]", sel?.code === s.code && "bg-cyan-400/[0.06]")}
                    data-testid={`state-row-${s.code}`}
                  >
                    <TableCell className="font-medium text-slate-100">{s.name}</TableCell>
                    <TableCell className="text-right font-mono">{fmtInt(s.engineers.employment)}</TableCell>
                    <TableCell className="text-right font-mono">{fmtMoney(s.engineers.mean_wage)}</TableCell>
                    <TableCell className="text-right font-mono">{fmtInt(s.technicians.employment)}</TableCell>
                    <TableCell className="text-right font-mono">{fmtMoney(s.technicians.mean_wage)}</TableCell>
                    <TableCell className="text-right font-mono">{s.operating_reactors}</TableCell>
                    <TableCell className="text-right font-mono">{s.annual_ne_degrees}</TableCell>
                    <TableCell className={cn("text-right font-mono", s.supply_balance === null ? "text-slate-500" : s.supply_balance >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {s.supply_balance === null ? "—" : `${s.supply_balance > 0 ? "+" : ""}${s.supply_balance}`}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
