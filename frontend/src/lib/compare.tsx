import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";

const MAX = 3;

interface CompareCtx {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

const Ctx = createContext<CompareCtx | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const toggle = (id: string) =>
    setIds((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX) {
        toast.warning(`Compare holds up to ${MAX} programs — remove one first.`);
        return cur;
      }
      return [...cur, id];
    });
  const value: CompareCtx = {
    ids,
    toggle,
    remove: (id) => setIds((cur) => cur.filter((x) => x !== id)),
    clear: () => setIds([]),
    has: (id) => ids.includes(id),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCompare() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCompare must be used inside CompareProvider");
  return c;
}
