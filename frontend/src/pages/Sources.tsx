import { ExternalLink } from "lucide-react";
import { DataBadge, Panel, SectionHead } from "@/components/atoms";
import { useProgramsSummary, useWorkforce } from "@/lib/queries";

const LABOR_SOURCES = [
  { label: "BLS Public Data API — OEWS series (live, cached)", url: "https://www.bls.gov/developers/" },
  { label: "BLS OEWS — Nuclear Engineers (17-2161)", url: "https://www.bls.gov/oes/current/oes172161.htm" },
  { label: "BLS OEWS — Nuclear Technicians (19-4051)", url: "https://www.bls.gov/oes/current/oes194051.htm" },
  { label: "BLS Occupational Outlook — Nuclear Engineers (2024–34)", url: "https://www.bls.gov/ooh/architecture-and-engineering/nuclear-engineers.htm" },
  { label: "BLS Occupational Outlook — Nuclear Technicians (2024–34)", url: "https://www.bls.gov/ooh/life-physical-and-social-science/nuclear-technicians.htm" },
  { label: "BLS OEWS metropolitan area estimates (location quotients)", url: "https://www.bls.gov/oes/tables.htm" },
  { label: "Census Gazetteer — metro area centroids", url: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html" },
  { label: "NEI Nuclear Uniform Curriculum Program (two-year tech programs)", url: "https://www.nei.org/" },
  { label: "Naval Nuclear Power Training Command", url: "https://www.netc.navy.mil/NNPTC/" },
  { label: "EIA / NRC — operating reactors by state", url: "https://www.nrc.gov/reactors/operating/map-power-reactors.html" },
  { label: "DOE Pathways to Commercial Liftoff: Advanced Nuclear (2024)", url: "https://liftoff.energy.gov/advanced-nuclear/" },
];

export default function Sources() {
  const summary = useProgramsSummary();
  const wf = useWorkforce();
  const academic = summary.data?.sources ?? [];
  return (
    <main className="mx-auto max-w-[1100px] px-4 pb-20 pt-8 md:px-8">
      <SectionHead eyebrow="Transparency" title="Sources & methodology" />
      <div className="grid gap-4 md:grid-cols-2">
        <Panel testId="sources-labels">
          <h3 className="font-heading text-lg font-semibold text-slate-100">How values are labeled</h3>
          <ul className="mt-3 space-y-3 text-sm text-slate-300">
            <li className="flex flex-col gap-1"><DataBadge kind="federal" className="w-fit" />Pulled from the BLS API (OEWS May {wf.data?.data_year ?? "2025"}) or BLS Employment Projections.</li>
            <li className="flex flex-col gap-1"><DataBadge kind="academic" className="w-fit" />Program enrollment & degrees calibrated so totals match ORISE national survey levels and IPEDS completions; 1/5/10-yr history is interpolated from the growth rates.</li>
            <li className="flex flex-col gap-1"><DataBadge kind="estimate" className="w-fit" />Budgets, research expenditure, placement and starting salary compiled from public department reports — approximate.</li>
            <li className="flex flex-col gap-1"><DataBadge kind="derived" className="w-fit" />Computed here: state openings (state employment × national openings rate), supply balance, and demand scenarios.</li>
          </ul>
        </Panel>
        <Panel testId="sources-list">
          <h3 className="font-heading text-lg font-semibold text-slate-100">Academic sources</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {academic.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-400 hover:underline">{s.label} <ExternalLink className="size-3" /></a>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 font-heading text-lg font-semibold text-slate-100">Labor-market sources</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {LABOR_SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-400 hover:underline">{s.label} <ExternalLink className="size-3" /></a>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel className="mt-4 text-sm leading-relaxed text-slate-400" testId="sources-caveats">
        <h3 className="mb-2 font-heading text-lg font-semibold text-slate-100">Caveats</h3>
        BLS suppresses OEWS estimates where samples are too small, so several states show “suppressed” even though nuclear workers exist there. Federal
        projections are national only — state-level openings are proportional estimates. Program-level budgets and placement rates are not reported uniformly across
        universities; treat them as order-of-magnitude indicators and confirm with each department. Keyless BLS API access is limited to 25 queries/day, so live
        refreshes are cached for 6 hours.
      </Panel>
    </main>
  );
}
