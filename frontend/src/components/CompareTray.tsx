import { AnimatePresence, motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useCompare } from "@/lib/compare";
import { usePrograms } from "@/lib/queries";

export default function CompareTray() {
  const { ids, remove, clear } = useCompare();
  const { data } = usePrograms();
  const { pathname } = useLocation();
  const show = ids.length > 0 && pathname !== "/compare";
  const items = ids.map((id) => data?.find((p) => p.id === id)).filter((p) => !!p);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 z-[1000] flex w-[min(720px,calc(100%-2rem))] -translate-x-1/2 flex-wrap items-center gap-2 rounded-xl border border-cyan-400/25 bg-[#0B0F17]/90 p-2.5 shadow-2xl backdrop-blur-xl cherenkov-glow"
          data-testid="compare-tray"
        >
          <span className="px-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">Compare {ids.length}/3</span>
          {items.map((p) => (
            <span key={p.id} className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/70 py-1 pl-2.5 pr-1 text-sm" data-testid={`compare-chip-${p.id}`}>
              {p.short_name}
              <button onClick={() => remove(p.id)} className="rounded p-0.5 text-slate-400 hover:bg-slate-700 hover:text-slate-100" aria-label={`Remove ${p.short_name}`} data-testid={`compare-chip-remove-${p.id}`}>
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          <div className="ml-auto flex gap-2">
            <button onClick={clear} className="px-2 text-xs text-slate-400 hover:text-slate-100" data-testid="compare-clear-button">Clear</button>
            <Link to="/compare" className={buttonVariants({ size: "sm" })} data-testid="compare-open-button">Open compare bench</Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
