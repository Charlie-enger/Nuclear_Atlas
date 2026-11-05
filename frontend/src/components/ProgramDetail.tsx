import type { ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ExternalLink, Plus, Check, Radiation } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataBadge, GrowthValue } from "@/components/atoms";
import { useCompare } from "@/lib/compare";
import type { Program } from "@/lib/types";
import { CHART, fmtInt, fmtMillions, fmtMoney, fmtPower, tooltipStyle } from "@/lib/format";

function Metric({ label, value, testId }: { label: string; value: ReactNode; testId: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-subtle/50 px-3 py-2" data-testid={testId}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-0.5 font-mono text-base text-slate-100">{value}</div>
    </div>
  );
}

export default function ProgramDetail({ program, onClose }: { program: Program | null; onClose: () => void }) {
  const compare = useCompare();
  const p = program;
  return (
    <Sheet open={!!p} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="z-[1200] w-full overflow-y-auto border-slate-800 bg-[#0D131F] sm:max-w-2xl" data-testid="program-detail-sheet">
        {p && (
          <>
            <SheetHeader className="border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                {p.us_news_rank && (
                  <Badge className="bg-amber-950 font-mono text-amber-200" data-testid="detail-rank">#{p.us_news_rank} US News</Badge>
                )}
                {p.abet_accredited && <Badge className="bg-emerald-950 text-emerald-300">ABET accredited</Badge>}
                <Badge variant="outline" className="border-slate-700 text-slate-300">{p.region}</Badge>
              </div>
              <SheetTitle className="font-heading text-2xl leading-tight text-slate-50" data-testid="detail-name">{p.name}</SheetTitle>
              <SheetDescription className="text-slate-400">
                {p.department} · {p.city}, {p.state} · est. {p.established}
              </SheetDescription>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant={compare.has(p.id) ? "secondary" : "default"}
                  onClick={() => compare.toggle(p.id)}
                  data-testid="detail-compare-toggle"
                >
                  {compare.has(p.id) ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                  {compare.has(p.id) ? "In compare" : "Add to compare"}
                </Button>
                <a
                  href={p.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2.5 text-xs text-sky-400 transition-colors hover:bg-slate-800"
                  data-testid="detail-website-link"
                >
                  Department site <ExternalLink className="size-3" />
                </a>
              </div>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-10">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-slate-300">Enrollment & growth</h3>
                  <DataBadge kind="academic" />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Metric label="Total enrollment" value={fmtInt(p.total_enrollment)} testId="detail-total-enrollment" />
                  <Metric label="Undergraduate" value={fmtInt(p.ug_enrollment)} testId="detail-ug-enrollment" />
                  <Metric label="Graduate (MS+PhD)" value={fmtInt(p.grad_enrollment)} testId="detail-grad-enrollment" />
                  <Metric label="1-yr growth" value={<GrowthValue v={p.growth_1y} />} testId="detail-growth-1y" />
                  <Metric label="5-yr growth" value={<GrowthValue v={p.growth_5y} />} testId="detail-growth-5y" />
                  <Metric label="10-yr growth" value={<GrowthValue v={p.growth_10y} />} testId="detail-growth-10y" />
                </div>
                <div className="mt-3 h-40" data-testid="detail-enrollment-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={p.enrollment_history} margin={{ left: -18, right: 8, top: 6 }}>
                      <defs>
                        <linearGradient id="enrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART.cyan} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={CHART.cyan} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={CHART.grid} vertical={false} />
                      <XAxis dataKey="year" stroke={CHART.axis} fontSize={11} tickLine={false} />
                      <YAxis stroke={CHART.axis} fontSize={11} tickLine={false} />
                      <Tooltip {...tooltipStyle} />
                      <Area type="monotone" dataKey="total" name="Enrollment" stroke={CHART.cyan} fill="url(#enrGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-slate-300">Graduates by year</h3>
                  <DataBadge kind="academic" />
                </div>
                <div className="mb-2 font-mono text-xs text-slate-400" data-testid="detail-annual-degrees">
                  {p.data_year}: {p.annual_bs} BS · {p.annual_ms} MS · {p.annual_phd} PhD = {p.annual_degrees} degrees
                </div>
                <div className="h-48" data-testid="detail-graduates-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={p.graduates_by_year} margin={{ left: -18, right: 8, top: 6 }}>
                      <CartesianGrid stroke={CHART.grid} vertical={false} />
                      <XAxis dataKey="year" stroke={CHART.axis} fontSize={11} tickLine={false} />
                      <YAxis stroke={CHART.axis} fontSize={11} tickLine={false} />
                      <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(56,189,248,0.06)" }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="bs" name="BS" stackId="g" fill={CHART.sky} />
                      <Bar dataKey="ms" name="MS" stackId="g" fill={CHART.cyan} />
                      <Bar dataKey="phd" name="PhD" stackId="g" fill={CHART.amber} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-slate-300">Budget & outcomes</h3>
                  <DataBadge kind="estimate" />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Metric label="Est. yearly budget" value={fmtMillions(p.budget_musd)} testId="detail-budget" />
                  <Metric label="Research expenditure" value={fmtMillions(p.research_expenditure_musd)} testId="detail-research-exp" />
                  <Metric label="Job placement" value={`${p.placement_rate}%`} testId="detail-placement" />
                  <Metric label="Median starting salary" value={p.median_starting_salary ? fmtMoney(p.median_starting_salary) : "Service commitment"} testId="detail-salary" />
                  <Metric label="Faculty" value={p.faculty} testId="detail-faculty" />
                  <Metric label="Students / faculty" value={p.students_per_faculty ?? "—"} testId="detail-ratio" />
                  <Metric label="Tuition (in-state)" value={p.tuition_in_state ? fmtMoney(p.tuition_in_state) : "Tuition-free"} testId="detail-tuition-in" />
                  <Metric label="Tuition (out-of-state)" value={p.tuition_out_state ? fmtMoney(p.tuition_out_state) : "Tuition-free"} testId="detail-tuition-out" />
                  <Metric label="Degrees" value={<span className="text-sm">{p.degrees.join(", ")}</span>} testId="detail-degrees" />
                </div>
              </div>

              <div className="rounded-lg border border-cyan-400/20 bg-cyan-950/30 p-4" data-testid="detail-reactor">
                <div className="flex items-center gap-2 font-heading text-sm font-semibold text-cyan-200">
                  <Radiation className="size-4" /> Research reactor
                </div>
                {p.research_reactor ? (
                  <div className="mt-1.5 text-sm text-slate-200">
                    <span className="font-semibold">{p.research_reactor.name}</span> — {p.research_reactor.type},{" "}
                    <span className="font-mono text-cherenkov">{fmtPower(p.research_reactor.power_kw)}</span>
                  </div>
                ) : (
                  <div className="mt-1.5 text-sm text-slate-400">No on-campus reactor — experiments run via partner/national lab facilities.</div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-heading text-sm font-semibold uppercase tracking-wider text-slate-300">Research focus</h3>
                  <div className="flex flex-wrap gap-1.5" data-testid="detail-focus">
                    {p.research_focus.map((f) => (
                      <span key={f} className="rounded border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-200">{f}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-heading text-sm font-semibold uppercase tracking-wider text-slate-300">Key partners</h3>
                  <ul className="space-y-1 text-sm text-slate-300" data-testid="detail-partners">
                    {p.partners.map((x) => <li key={x}>· {x}</li>)}
                  </ul>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Reference year AY {p.data_year - 1}–{String(p.data_year).slice(2)}. Program-level enrollment and degree splits are calibrated to ORISE
                national totals and IPEDS completions; budgets, placement and salaries are estimates from public department material. Verify with the department before decisions.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
