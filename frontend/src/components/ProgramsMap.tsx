import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { Program } from "@/lib/types";
import { fmtInt } from "@/lib/format";

const TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const ATTR = "Tiles &copy; Esri — Esri, HERE, Garmin, &copy; OpenStreetMap contributors";

export function programColor(p: Program) {
  if (p.research_reactor) return "#00F0FF";
  if (p.ug_enrollment === 0) return "#F59E0B";
  return "#38BDF8";
}

function pinIcon(p: Program, active: boolean) {
  const size = Math.round(12 + Math.sqrt(p.total_enrollment) * 0.9);
  const ring = p.research_reactor ? '<span class="ring"></span>' : "";
  return L.divIcon({
    className: `program-pin${active ? " active" : ""}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div data-testid="program-marker-${p.id}" style="position:relative;width:${size}px;height:${size}px">${ring}<span class="core" style="background:${programColor(p)}"></span></div>`,
  });
}

function FlyTo({ program }: { program: Program | null }) {
  const map = useMap();
  useEffect(() => {
    if (program) map.flyTo([program.lat, program.lng], Math.max(map.getZoom(), 6), { duration: 0.8 });
  }, [program, map]);
  return null;
}

export default function ProgramsMap({
  programs,
  selected,
  onSelect,
}: {
  programs: Program[];
  selected: Program | null;
  onSelect: (p: Program) => void;
}) {
  const icons = useMemo(
    () => Object.fromEntries(programs.map((p) => [p.id, pinIcon(p, selected?.id === p.id)])),
    [programs, selected],
  );
  return (
    <div className="relative h-full w-full" data-testid="programs-map">
      <MapContainer center={[38.5, -96]} zoom={4} minZoom={3} scrollWheelZoom className="h-full w-full rounded-xl">
        <TileLayer url={TILE} attribution={ATTR} maxZoom={16} />
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}" maxZoom={16} />
        {programs.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icons[p.id]} eventHandlers={{ click: () => onSelect(p) }}>
            <Tooltip direction="top" offset={[0, -8]} className="nuke-tip">
              <div className="font-semibold">{p.short_name}</div>
              <div className="text-[11px] text-slate-400">
                {p.city}, {p.state} · {fmtInt(p.total_enrollment)} students
              </div>
            </Tooltip>
          </Marker>
        ))}
        <FlyTo program={selected} />
      </MapContainer>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-md border border-slate-800 bg-[#0B0F17]/90 px-3 py-2 text-[11px] text-slate-300 backdrop-blur">
        <div className="mb-1 font-mono uppercase tracking-wider text-slate-500">Legend · size = enrollment</div>
        <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-cherenkov" /> On-campus research reactor</div>
        <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-sky-400" /> Undergrad + grad program</div>
        <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-amber-atomic" /> Graduate-only program</div>
      </div>
    </div>
  );
}
