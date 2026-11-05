import { NavLink } from "react-router-dom";
import { Atom } from "lucide-react";
import { useWorkforce } from "@/lib/queries";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Programs Atlas", id: "programs" },
  { to: "/workforce", label: "Jobs & Workforce", id: "workforce" },
  { to: "/compare", label: "Compare Bench", id: "compare" },
  { to: "/sources", label: "Sources & Method", id: "sources" },
];

export default function AppHeader() {
  const { data, isError } = useWorkforce();
  const live = !!data && !isError;
  return (
    <header className="sticky top-0 z-[1100] border-b border-slate-800/80 bg-[#0B0F17]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-8">
        <NavLink to="/" className="flex items-center gap-2.5" data-testid="header-logo-link">
          <span className="grid size-8 place-items-center rounded-md border border-cyan-400/30 bg-cyan-400/10 text-cherenkov cherenkov-glow">
            <Atom className="size-4.5" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Nuclear<span className="text-cherenkov">Atlas</span>
            <span className="ml-1.5 font-mono text-[11px] font-normal text-slate-500">US</span>
          </span>
        </NavLink>
        <nav className="order-3 flex w-full gap-1 overflow-x-auto md:order-none md:w-auto" data-testid="main-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end
              data-testid={`nav-${n.id}`}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
                  isActive ? "bg-cyan-400/10 text-cherenkov" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div
          className="ml-auto flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 font-mono text-[11px] text-slate-400"
          data-testid="bls-status-badge"
        >
          <span className={cn("size-1.5 rounded-full", live ? "bg-emerald-400 animate-blink" : "bg-amber-400")} />
          {live ? `BLS OEWS ${data?.data_year ?? ""} · ${data?.is_live_cache ? "live API" : "snapshot"}` : "BLS offline · static"}
        </div>
      </div>
    </header>
  );
}
