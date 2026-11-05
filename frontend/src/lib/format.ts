export const fmtInt = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : Math.round(n).toLocaleString("en-US");

export const fmtMoney = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `$${Math.round(n).toLocaleString("en-US")}`;

export const fmtMillions = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}M`;

export const fmtPct = (n: number | null | undefined, signed = true) =>
  n === null || n === undefined ? "—" : `${signed && n > 0 ? "+" : ""}${n.toFixed(1)}%`;

export const fmtPower = (kw: number) =>
  kw >= 1000 ? `${(kw / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })} MW` : kw >= 1 ? `${kw} kW` : `${kw * 1000} W`;

export const CHART = {
  cyan: "#00F0FF",
  sky: "#38BDF8",
  amber: "#F59E0B",
  emerald: "#34D399",
  rose: "#F87171",
  grid: "rgba(148,163,184,0.12)",
  axis: "#64748B",
};

export const tooltipStyle = {
  contentStyle: {
    background: "#0B0F17",
    border: "1px solid rgba(56,189,248,0.25)",
    borderRadius: 8,
    fontSize: 12,
    color: "#F1F5F9",
  },
  labelStyle: { color: "#94A3B8" },
};
