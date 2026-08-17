/** Formatea un monto en bolivianos: 45 → "Bs. 45.00" */
export function money(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "Bs. 0.00";
  return `Bs. ${n.toFixed(2)}`;
}

/** Convierte los NUMERIC de Postgres (que llegan como string) a number. */
export function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** "17 ago 2026, 15:42" */
export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
