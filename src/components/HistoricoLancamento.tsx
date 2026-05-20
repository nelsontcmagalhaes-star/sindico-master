import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatBRL, formatDateBR } from "@/lib/format";
import { History, TrendingUp, TrendingDown, Minus } from "lucide-react";

type Tipo = "despesa" | "receita";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tipo: Tipo;
  descricao: string;
  contraparte?: string | null; // fornecedor (despesa) ou pagador (receita)
  currentId?: string;
}

const norm = (s: string | null | undefined) =>
  (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

interface Item {
  id: string;
  data: string;
  valor: number;
  pago_recebido: boolean;
  extra?: string;
}

export default function HistoricoLancamento({ open, onOpenChange, tipo, descricao, contraparte, currentId }: Props) {
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ["historico", tipo, norm(descricao), norm(contraparte)],
    enabled: open,
    queryFn: async () => {
      if (tipo === "despesa") {
        const { data, error } = await supabase
          .from("despesas")
          .select("id, descricao, fornecedor, vencimento, valor_parcela, pago, forma_pagamento")
          .order("vencimento", { ascending: false });
        if (error) throw error;
        const alvo = norm(descricao);
        const alvoForn = norm(contraparte);
        return (data ?? [])
          .filter((d) => {
            const matchDesc = norm(d.descricao) === alvo;
            const matchForn = alvoForn && norm(d.fornecedor) === alvoForn;
            return matchDesc || matchForn;
          })
          .map((d) => ({
            id: d.id,
            data: d.vencimento,
            valor: Number(d.valor_parcela || 0),
            pago_recebido: !!d.pago,
            extra: d.fornecedor ?? undefined,
          }));
      } else {
        const { data, error } = await supabase
          .from("receitas")
          .select("id, descricao, pagador, data_recebimento, valor, recebido")
          .order("data_recebimento", { ascending: false });
        if (error) throw error;
        const alvo = norm(descricao);
        const alvoPag = norm(contraparte);
        return (data ?? [])
          .filter((r) => {
            const matchDesc = norm(r.descricao) === alvo;
            const matchPag = alvoPag && norm(r.pagador) === alvoPag;
            return matchDesc || matchPag;
          })
          .map((r) => ({
            id: r.id,
            data: r.data_recebimento,
            valor: Number(r.valor || 0),
            pago_recebido: !!r.recebido,
            extra: r.pagador ?? undefined,
          }));
      }
    },
  });

  const stats = useMemo(() => {
    if (items.length === 0) return null;
    const valores = items.map((i) => i.valor);
    const total = valores.reduce((s, v) => s + v, 0);
    const media = total / valores.length;
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const ordenadosAsc = [...items].sort((a, b) => a.data.localeCompare(b.data));
    const primeiro = ordenadosAsc[0];
    const ultimo = ordenadosAsc[ordenadosAsc.length - 1];
    const variacao =
      primeiro.valor > 0 ? ((ultimo.valor - primeiro.valor) / primeiro.valor) * 100 : 0;
    return { total, media, min, max, qtd: items.length, variacao, primeiro, ultimo };
  }, [items]);

  const labelStatus = tipo === "despesa" ? { sim: "Pago", nao: "A vencer" } : { sim: "Recebido", nao: "A receber" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> Histórico do lançamento
          </DialogTitle>
          <DialogDescription className="line-clamp-2">
            {descricao}
            {contraparte && <> · <span className="font-medium">{contraparte}</span></>}
          </DialogDescription>
        </DialogHeader>

        {isLoading && <p className="text-center text-muted-foreground py-6">Carregando...</p>}

        {!isLoading && items.length === 0 && (
          <p className="text-center text-muted-foreground py-6">Nenhum histórico encontrado.</p>
        )}

        {!isLoading && stats && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Ocorrências</p>
                <p className="font-bold">{stats.qtd}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Total acumulado</p>
                <p className="font-bold">{formatBRL(stats.total)}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Média</p>
                <p className="font-bold">{formatBRL(stats.media)}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Mín / Máx</p>
                <p className="font-bold text-sm">{formatBRL(stats.min)} / {formatBRL(stats.max)}</p>
              </Card>
            </div>

            {stats.qtd > 1 && (
              <Card className="p-3 flex items-center gap-2">
                {stats.variacao > 0 ? (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                ) : stats.variacao < 0 ? (
                  <TrendingDown className="h-4 w-4 text-success" />
                ) : (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
                <p className="text-xs">
                  Variação do 1º ({formatBRL(stats.primeiro.valor)}) ao último ({formatBRL(stats.ultimo.valor)}):{" "}
                  <span className="font-bold">
                    {stats.variacao > 0 ? "+" : ""}
                    {stats.variacao.toFixed(1)}%
                  </span>
                </p>
              </Card>
            )}

            <ScrollArea className="max-h-[40vh] pr-2">
              <div className="space-y-2">
                {items.map((it) => (
                  <Card
                    key={it.id}
                    className={`p-3 ${it.id === currentId ? "border-primary border-2" : ""}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{formatDateBR(it.data)}</p>
                        {it.extra && <p className="text-xs text-muted-foreground truncate">{it.extra}</p>}
                        <Badge
                          variant={it.pago_recebido ? "default" : "secondary"}
                          className={`mt-1 ${it.pago_recebido ? "bg-success text-success-foreground" : ""}`}
                        >
                          {it.pago_recebido ? labelStatus.sim : labelStatus.nao}
                        </Badge>
                      </div>
                      <p className="font-bold">{formatBRL(it.valor)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
