// Detecta lançamentos potencialmente duplicados no mesmo mês.
// Critério: mesma descrição (normalizada) + mesmo valor + mesmo mês (YYYY-MM) da data informada.

const norm = (s: string | null | undefined) =>
  (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export interface DuplicateItem {
  id: string;
  descricao: string;
  data: string; // YYYY-MM-DD
  valor: number;
}

/**
 * Recebe a lista completa e devolve um Set com os IDs que aparecem
 * mais de uma vez no mesmo mês, com a mesma descrição e o mesmo valor.
 */
export function findDuplicateIds<T extends DuplicateItem>(items: T[]): Set<string> {
  const groups = new Map<string, string[]>();
  for (const it of items) {
    if (!it.data) continue;
    const mes = it.data.slice(0, 7);
    const key = `${mes}|${norm(it.descricao)}|${Number(it.valor || 0).toFixed(2)}`;
    const arr = groups.get(key) ?? [];
    arr.push(it.id);
    groups.set(key, arr);
  }
  const dup = new Set<string>();
  for (const ids of groups.values()) {
    if (ids.length > 1) ids.forEach((id) => dup.add(id));
  }
  return dup;
}
