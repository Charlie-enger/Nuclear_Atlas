import L from "leaflet";
import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import type { Employer, MetroWorkforce, StateWorkforce, TrainingSite } from "@/lib/types";
import { fmtInt, fmtMoney } from "@/lib/format";

const TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const ATTR = "Tiles &copy; Esri — Esri, HERE, Garmin, &copy; OpenStreetMap contributors";

export type JobMetric = "eng_emp" | "tech_emp" | "eng_wage" | "reactors" | "balance";
export type MetroMetric = "m_eng_emp" | "m_lq" | "m_wage" | "m_tech_emp";
export type MapView = "states" | "metros";

interface MetricDef<T> { label: string; color: string; get: (s: T) => number | null; fmt: (n: number) => string }

export const METRICS: Record<JobMetric, MetricDef<StateWorkforce>> = {
  eng_emp: { label: "Nuclear engineers employed", color: "#00F0FF", get: (s) => s.engineers.employment, fmt: fmtInt },
  tech_emp: { label: "Nuclear technicians employed", color: "#F59E0B", get: (s) => s.technicians.employment, fmt: fmtInt },
  eng_wage: { label: "Engineer mean annual wage", color: "#34D399", get: (s) => s.engineers.mean_wage, fmt: fmtMoney },
  reactors: { label: "Operating power reactors", color: "#38BDF8", get: (s) => s.operating_reactors || null, fmt: (n) => String(n) },
  balance: { label: "NE grads minus est. engineer openings", color: "#34D399", get: (s) => s.supply_balance, fmt: (n) => `${n > 0 ? "+" : ""}${n}/yr` },
};

export const METRO_METRICS: Record<MetroMetric, MetricDef<MetroWorkforce>> = {
  m_eng_emp: { label: "Metro: nuclear engineers employed", color: "#00F0FF", get: (m) => m.ne_employment, fmt: fmtInt },
  m_lq: { label: "Metro: concentration (location quotient)", color: "#F472B6", get: (m) => m.ne_location_quotient, fmt: (n) => `${n.toFixed(1)}× US avg` },
  m_wage: { label: "Metro: engineer mean wage", color: "#34D399", get: (m) => m.ne_mean_wage, fmt: fmtMoney },
  m_tech_emp: { label: "Metro: nuclear technicians employed", color: "#F59E0B", get: (m) => m.tech_employment, fmt: fmtInt },
};

const EMPLOYER_COLORS: Record<string, string> = {
  "National Lab": "#00F0FF",
  Vendor: "#F59E0B",
  Utility: "#34D399",
  Naval: "#38BDF8",
  Regulator: "#F87171",
};

export const TRAINING_COLORS: Record<string, string> = {
  "Community / Technical College": "#A3E635",
  "Navy Nuclear Training": "#60A5FA",
  "Shipyard Apprenticeship": "#FB923C",
};

function employerIcon(type: string) {
  const c = EMPLOYER_COLORS[type] ?? "#94A3B8";
  return L.divIcon({
    className: "employer-pin",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    html: `<div style="width:10px;height:10px;transform:rotate(45deg);background:${c};border:1.5px solid #0B0F17;box-shadow:0 0 8px ${c}"></div>`,
  });
}

function trainingIcon(site: TrainingSite) {
  const c = TRAINING_COLORS[site.type] ?? "#A3E635";
  return L.divIcon({
    className: "employer-pin",
    iconSize: [14, 13],
    iconAnchor: [7, 7],
    html: `<div data-testid="training-marker-${site.id}" style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:12px solid ${c};filter:drop-shadow(0 0 4px ${c})"></div>`,
  });
}

interface Props {
  view: MapView;
  states: StateWorkforce[];
  metros: MetroWorkforce[];
  employers: Employer[];
  training: TrainingSite[];
  metric: JobMetric;
  metroMetric: MetroMetric;
  showEmployers: boolean;
  showTraining: boolean;
  selected: string | null;
  onSelect: (code: string) => void;
}

function scale(values: (number | null)[], v: number | null, offsetMin: boolean) {
  const nums = values.filter((x): x is number => x !== null);
  if (v === null || !nums.length) return 0;
  const max = Math.max(...nums.map(Math.abs), 1);
  const min = offsetMin ? Math.min(...nums) : 0;
  return offsetMin ? (v - min) / Math.max(1, max - min) : Math.abs(v) / max;
}

export default function JobsMap(p: Props) {
  const sm = METRICS[p.metric];
  const mm = METRO_METRICS[p.metroMetric];
  const stateVals = p.states.map(sm.get);
  const metroVals = p.metros.map(mm.get);

  return (
    <div className="relative h-full w-full" data-testid="jobs-map">
      <MapContainer center={[38.5, -96]} zoom={4} minZoom={3} scrollWheelZoom className="h-full w-full">
        <TileLayer url={TILE} attribution={ATTR} maxZoom={16} />
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}" maxZoom={16} />
        {p.view === "states" &&
          p.states.map((s) => {
            const v = sm.get(s);
            const has = v !== null;
            const radius = has ? 6 + Math.sqrt(scale(stateVals, v, p.metric === "eng_wage")) * 26 : 3;
            const color = !has ? "#475569" : p.metric === "balance" ? (v >= 0 ? "#34D399" : "#F87171") : sm.color;
            const isSel = p.selected === s.code;
            return (
              <CircleMarker
                key={`${p.metric}-${s.code}`}
                center={[s.lat, s.lng]}
                radius={radius}
                pathOptions={{ color: isSel ? "#F8FAFC" : color, weight: isSel ? 2.5 : 1, fillColor: color, fillOpacity: has ? 0.35 : 0.5, className: `state-bubble state-bubble-${s.code}` }}
                eventHandlers={{ click: () => p.onSelect(s.code) }}
              >
                <Tooltip direction="top" className="nuke-tip">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-[11px] text-slate-400">{sm.label}: {has ? sm.fmt(v) : "suppressed / n.a."}</div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        {p.view === "metros" &&
          p.metros.map((m) => {
            const v = mm.get(m);
            const has = v !== null;
            const radius = has ? 6 + Math.sqrt(scale(metroVals, v, p.metroMetric === "m_wage")) * 24 : 7;
            const isSel = p.selected === m.code;
            return (
              <CircleMarker
                key={`${p.metroMetric}-${m.code}`}
                center={[m.lat, m.lng]}
                radius={radius}
                pathOptions={{
                  color: isSel ? "#F8FAFC" : has ? mm.color : "#94A3B8",
                  weight: isSel ? 2.5 : has ? 1.2 : 1.5,
                  dashArray: has ? undefined : "3 3",
                  fillColor: has ? mm.color : "#475569",
                  fillOpacity: has ? 0.4 : 0.2,
                  className: `metro-bubble metro-bubble-${m.code}`,
                }}
                eventHandlers={{ click: () => p.onSelect(m.code) }}
              >
                <Tooltip direction="top" className="nuke-tip">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-[11px] text-slate-400">{mm.label.replace("Metro: ", "")}: {has ? mm.fmt(v) : "BLS estimate suppressed"}</div>
                  {m.anchor && <div className="max-w-60 whitespace-normal text-[11px] text-cyan-200">{m.anchor}</div>}
                </Tooltip>
              </CircleMarker>
            );
          })}
        {p.showEmployers &&
          p.employers.map((e) => (
            <Marker key={e.name} position={[e.lat, e.lng]} icon={employerIcon(e.type)}>
              <Tooltip direction="top" className="nuke-tip">
                <div className="font-semibold">{e.name}</div>
                <div className="text-[11px] text-slate-400">{e.type} · {e.city}, {e.state}</div>
                <div className="max-w-56 whitespace-normal text-[11px] text-slate-300">{e.focus}</div>
              </Tooltip>
            </Marker>
          ))}
        {p.showTraining &&
          p.training.map((t) => (
            <Marker key={t.id} position={[t.lat, t.lng]} icon={trainingIcon(t)}>
              <Tooltip direction="top" className="nuke-tip">
                <div className="font-semibold">{t.name}</div>
                <div className="text-[11px] text-slate-400">{t.type} · {t.city}, {t.state}</div>
                <div className="max-w-60 whitespace-normal text-[11px] text-lime-200">{t.credentials.join(" · ")}</div>
                <div className="text-[11px] text-slate-300">{t.annual_completers ? `~${fmtInt(t.annual_completers)} completers/yr (est.)` : "Part of Navy pipeline"}</div>
              </Tooltip>
            </Marker>
          ))}
      </MapContainer>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-md border border-slate-800 bg-[#0B0F17]/90 px-3 py-2 text-[11px] text-slate-300 backdrop-blur" data-testid="jobs-map-legend">
        <div className="mb-1 font-mono uppercase tracking-wider text-slate-500">Bubble = {p.view === "states" ? sm.label : mm.label.replace("Metro: ", "metro ")}</div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full border border-dashed border-slate-400 bg-slate-600" /> BLS estimate suppressed
        </div>
        {p.showEmployers &&
          Object.entries(EMPLOYER_COLORS).map(([k, c]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="size-2 rotate-45" style={{ background: c }} /> {k}
            </div>
          ))}
        {p.showTraining &&
          Object.entries(TRAINING_COLORS).map(([k, c]) => (
            <div key={k} className="flex items-center gap-2">
              <span style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: `7px solid ${c}` }} /> {k}
            </div>
          ))}
      </div>
    </div>
  );
}
