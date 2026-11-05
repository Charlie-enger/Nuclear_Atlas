import L from "leaflet";
import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import type { Employer, StateWorkforce } from "@/lib/types";
import { fmtInt, fmtMoney } from "@/lib/format";

const TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const ATTR = "Tiles &copy; Esri — Esri, HERE, Garmin, &copy; OpenStreetMap contributors";

export type JobMetric = "eng_emp" | "tech_emp" | "eng_wage" | "reactors" | "balance";

export const METRICS: Record<JobMetric, { label: string; color: string; get: (s: StateWorkforce) => number | null; fmt: (n: number) => string }> = {
  eng_emp: { label: "Nuclear engineers employed", color: "#00F0FF", get: (s) => s.engineers.employment, fmt: fmtInt },
  tech_emp: { label: "Nuclear technicians employed", color: "#F59E0B", get: (s) => s.technicians.employment, fmt: fmtInt },
  eng_wage: { label: "Engineer mean annual wage", color: "#34D399", get: (s) => s.engineers.mean_wage, fmt: fmtMoney },
  reactors: { label: "Operating power reactors", color: "#38BDF8", get: (s) => s.operating_reactors || null, fmt: (n) => String(n) },
  balance: { label: "NE grads minus est. engineer openings", color: "#34D399", get: (s) => s.supply_balance, fmt: (n) => `${n > 0 ? "+" : ""}${n}/yr` },
};

const EMPLOYER_COLORS: Record<string, string> = {
  "National Lab": "#00F0FF",
  Vendor: "#F59E0B",
  Utility: "#34D399",
  Naval: "#38BDF8",
  Regulator: "#F87171",
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

export default function JobsMap({
  states,
  employers,
  metric,
  showEmployers,
  selected,
  onSelect,
}: {
  states: StateWorkforce[];
  employers: Employer[];
  metric: JobMetric;
  showEmployers: boolean;
  selected: string | null;
  onSelect: (code: string) => void;
}) {
  const m = METRICS[metric];
  const max = Math.max(1, ...states.map((s) => Math.abs(m.get(s) ?? 0)));
  const minVal = metric === "eng_wage" ? Math.min(...states.map((s) => m.get(s) ?? Infinity)) : 0;

  return (
    <div className="relative h-full w-full" data-testid="jobs-map">
      <MapContainer center={[38.5, -96]} zoom={4} minZoom={3} scrollWheelZoom className="h-full w-full">
        <TileLayer url={TILE} attribution={ATTR} maxZoom={16} />
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}" maxZoom={16} />
        {states.map((s) => {
          const v = m.get(s);
          const has = v !== null && v !== undefined;
          const scaled = has ? (metric === "eng_wage" ? (v - minVal) / Math.max(1, max - minVal) : Math.abs(v) / max) : 0;
          const radius = has ? 6 + Math.sqrt(scaled) * 26 : 3;
          const color = !has ? "#475569" : metric === "balance" ? (v >= 0 ? "#34D399" : "#F87171") : m.color;
          const isSel = selected === s.code;
          return (
            <CircleMarker
              key={`${metric}-${s.code}`}
              center={[s.lat, s.lng]}
              radius={radius}
              pathOptions={{
                color: isSel ? "#F8FAFC" : color,
                weight: isSel ? 2.5 : 1,
                fillColor: color,
                fillOpacity: has ? 0.35 : 0.5,
                className: `state-bubble state-bubble-${s.code}`,
              }}
              eventHandlers={{ click: () => onSelect(s.code) }}
            >
              <Tooltip direction="top" className="nuke-tip">
                <div className="font-semibold">{s.name}</div>
                <div className="text-[11px] text-slate-400">{m.label}: {has ? m.fmt(v) : "suppressed / n.a."}</div>
              </Tooltip>
            </CircleMarker>
          );
        })}
        {showEmployers &&
          employers.map((e) => (
            <Marker key={e.name} position={[e.lat, e.lng]} icon={employerIcon(e.type)}>
              <Tooltip direction="top" className="nuke-tip">
                <div className="font-semibold">{e.name}</div>
                <div className="text-[11px] text-slate-400">{e.type} · {e.city}, {e.state}</div>
                <div className="max-w-56 whitespace-normal text-[11px] text-slate-300">{e.focus}</div>
              </Tooltip>
            </Marker>
          ))}
      </MapContainer>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-md border border-slate-800 bg-[#0B0F17]/90 px-3 py-2 text-[11px] text-slate-300 backdrop-blur">
        <div className="mb-1 font-mono uppercase tracking-wider text-slate-500">Bubble = {m.label}</div>
        <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-slate-600" /> BLS estimate suppressed / none</div>
        {showEmployers &&
          Object.entries(EMPLOYER_COLORS).map(([k, c]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="size-2 rotate-45" style={{ background: c }} /> {k}
            </div>
          ))}
      </div>
    </div>
  );
}
