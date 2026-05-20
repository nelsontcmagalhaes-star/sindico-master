import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, FileText } from "lucide-react";
import { formatBRL, formatDateBR, todayISO } from "@/lib/format";
import { toast } from "sonner";
import SaldoMes from "@/components/SaldoMes";

interface Despesa {
  id: string;
  descricao: string;
  fornecedor: string | null;
  valor_parcela: number;
  vencimento: string;
  pago: boolean;
  data_pagamento: string | null;
}

export default function Relatorios() {
  useEffect(() => { document.title = "Relatórios - Vencix Condomínio"; }, []);

  const [periodo, setPeriodo] = useState<"30" | "mes" | "ano" | "tudo">("mes");

  const { data = [] } = useQuery<Despesa[]>({
    queryKey: ["despesas-rel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("despesas")
        .select("id, descricao, fornecedor, valor_parcela, vencimento, pago, data_pagamento")
        .order("vencimento");
      if (error) throw error;
      return (data ?? []) as Despesa[];
    },
  });

  const hoje = todayISO();
  const inicio = useMemo(() => {
    const d = new Date();
    if (periodo === "30") { d.setDate(d.getDate() - 30); }
    else if (periodo === "mes") { d.setDate(1); }
    else if (periodo === "ano") { d.setMonth(0, 1); }
    else return "1900-01-01";
    return d.toISOString().slice(0, 10);
  }, [periodo]);

  const filtradas = data.filter((d) => d.vencimento >= inicio);

  const totalGeral = filtradas.reduce((s, d) => s + Number(d.valor_parcela), 0);
  const totalPago = filtradas.filter((d) => d.pago).reduce((s, d) => s + Number(d.valor_parcela), 0);
  const totalAVencer = filtradas.filter((d) => !d.pago).reduce((s, d) => s + Number(d.valor_parcela), 0);
  const totalVencido = filtradas.filter((d) => !d.pago && d.vencimento < hoje).reduce((s, d) => s + Number(d.valor_parcela), 0);

  // Por fornecedor
  const porForn = Object.entries(
    filtradas.reduce<Record<string, number>>((acc, d) => {
      const k = d.fornecedor || "Sem fornecedor";
      acc[k] = (acc[k] ?? 0) + Number(d.valor_parcela);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  // Por mês
  const porMes = Object.entries(
    filtradas.reduce<Record<string, number>>((acc, d) => {
      const k = d.vencimento.slice(0, 7);
      acc[k] = (acc[k] ?? 0) + Number(d.valor_parcela);
      return acc;
    }, {})
  ).sort();

  const exportarCSV = () => {
    const header = ["Descrição", "Fornecedor", "Valor", "Vencimento", "Status", "Data Pagamento"];
    const rows = filtradas.map((d) => [
      `"${d.descricao.replace(/"/g, '""')}"`,
      `"${(d.fornecedor ?? "").replace(/"/g, '""')}"`,
      String(d.valor_parcela).replace(".", ","),
      formatDateBR(d.vencimento),
      d.pago ? "Pago" : d.vencimento < hoje ? "Vencida" : "A Vencer",
      formatDateBR(d.data_pagamento),
    ]);
    const csv = [header.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-condominio-${hoje}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="h-5 w-5" />Relatórios</h2>
        <Button size="sm" variant="outline" onClick={exportarCSV}>
          <Download className="h-4 w-4 mr-1" />CSV
        </Button>
      </div>

      <SaldoMes />

      <Tabs value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="30">30 dias</TabsTrigger>
          <TabsTrigger value="mes">Este mês</TabsTrigger>
          <TabsTrigger value="ano">Ano</TabsTrigger>
          <TabsTrigger value="tudo">Tudo</TabsTrigger>
        </TabsList>

        <TabsContent value={periodo} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-gradient-primary text-primary-foreground shadow-card">
              <p className="text-xs opacity-90">Total geral</p>
              <p className="text-xl font-bold mt-1">{formatBRL(totalGeral)}</p>
            </Card>
            <Card className="p-4 bg-gradient-success text-success-foreground shadow-card">
              <p className="text-xs opacity-90">Pago</p>
              <p className="text-xl font-bold mt-1">{formatBRL(totalPago)}</p>
            </Card>
            <Card className="p-4 bg-gradient-warn text-warning-foreground shadow-card">
              <p className="text-xs opacity-90">A vencer</p>
              <p className="text-xl font-bold mt-1">{formatBRL(totalAVencer)}</p>
            </Card>
            <Card className="p-4 shadow-card">
              <p className="text-xs text-destructive">Vencido</p>
              <p className="text-xl font-bold mt-1 text-destructive">{formatBRL(totalVencido)}</p>
            </Card>
          </div>

          <Card className="p-4 shadow-card">
            <h3 className="font-semibold mb-3">Por fornecedor</h3>
            <div className="space-y-2">
              {porForn.length === 0 && <p className="text-sm text-muted-foreground">Sem dados</p>}
              {porForn.map(([k, v]) => {
                const pct = totalGeral ? (v / totalGeral) * 100 : 0;
                return (
                  <div key={k}>
                    <div className="flex justify-between text-sm">
                      <span className="truncate flex-1">{k}</span>
                      <span className="font-medium ml-2">{formatBRL(v)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4 shadow-card">
            <h3 className="font-semibold mb-3">Por mês de vencimento</h3>
            <div className="space-y-2">
              {porMes.length === 0 && <p className="text-sm text-muted-foreground">Sem dados</p>}
              {porMes.map(([k, v]) => {
                const [y, m] = k.split("-");
                return (
                  <div key={k} className="flex justify-between text-sm border-b border-border pb-1.5 last:border-0">
                    <span>{m}/{y}</span>
                    <span className="font-medium">{formatBRL(v)}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4 shadow-card">
            <h3 className="font-semibold mb-3">Lançamentos ({filtradas.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filtradas.map((d) => (
                <div key={d.id} className="flex justify-between gap-2 text-xs border-b border-border pb-1.5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{d.descricao}</p>
                    <p className="text-muted-foreground">{d.fornecedor} • {formatDateBR(d.vencimento)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatBRL(d.valor_parcela)}</p>
                    <p className={d.pago ? "text-success" : d.vencimento < hoje ? "text-destructive" : "text-muted-foreground"}>
                      {d.pago ? "Pago" : d.vencimento < hoje ? "Vencida" : "A vencer"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
