export type Periodicidade = "mensal" | "bimestral" | "trimestral" | "semestral" | "anual" | "unica";

export const PERIODICIDADE_LABEL: Record<Periodicidade, string> = {
  mensal: "Mensal",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
  unica: "Única",
};

const MONTHS: Record<Periodicidade, number> = {
  mensal: 1, bimestral: 2, trimestral: 3, semestral: 6, anual: 12, unica: 0,
};

/** Soma a periodicidade a uma data (string yyyy-mm-dd) e retorna nova string yyyy-mm-dd */
export function addPeriodicidade(dateStr: string, p: Periodicidade): string {
  const m = MONTHS[p];
  if (!m) return dateStr;
  const [y, mo, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  dt.setUTCMonth(dt.getUTCMonth() + m);
  return dt.toISOString().slice(0, 10);
}
