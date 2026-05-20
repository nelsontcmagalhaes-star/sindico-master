import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Trash2, Search, Pencil, AlertTriangle, History } from "lucide-react";
import { formatBRL, formatDateBR, todayISO } from "@/lib/format";
import DespesaForm from "@/components/DespesaForm";
import HistoricoLancamento from "@/components/HistoricoLancamento";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { findDuplicateIds } from "@/lib/duplicates";

interface Despesa {
  id: string;
  data_compra: string | null;
  descricao: string;
  fornecedor: string | null;
  valor_total: number;
  num_parcelas: string | null;
  parcela_atual: number;
  valor_parcela: number;
  vencimento: string;
  pago: boolean;
  data_pagamento: string | null;
  forma_pagamento: string;
}

const FORMA_LABEL: Record<string, string> = { boleto: "Boleto", pix: "PIX", cartao: "Cartão" };

export default function Despesas() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Despesa | null>(null);
  const [historico, setHistorico] = useState<Despesa | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "avencer" | "pagas" | "vencidas">("todas");
  const [forma, setForma] = useState<"todas" | "boleto" | "pix" | "cartao">("todas");
  const [busca, setBusca] = useState("");
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string | null>(null);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState<string>("todos");

  const { data = [], isLoading } = useQuery<Despesa[]>({
    queryKey: ["despesas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("despesas")
        .select("*")
        .order("vencimento", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Despesa[];
    },
  });

  const hoje = todayISO();
  const mesAtual = hoje.slice(0, 7); // YYYY-MM
  const porForma = forma === "todas" ? data : data.filter((d) => (d.forma_pagamento ?? "boleto") === forma);

  // Totais a vencer por mês (não mistura meses)
  const aVencerPorMes = porForma
    .filter((d) => !d.pago)
    .reduce<Record<string, { total: number; qtd: number }>>((acc, d) => {
      const k = d.vencimento.slice(0, 7);
      if (!acc[k]) acc[k] = { total: 0, qtd: 0 };
      acc[k].total += Number(d.valor_parcela);
      acc[k].qtd += 1;
      return acc;
    }, {});
  const mesesOrdenados = Object.entries(aVencerPorMes).sort(([a], [b]) => a.localeCompare(b));
  const totalMesAtual = aVencerPorMes[mesAtual] ?? { total: 0, qtd: 0 };
  const totalGeralAVencer = mesesOrdenados.reduce((s, [, v]) => s + v.total, 0);

  // Lista única de fornecedores para o autocomplete
  const fornecedoresUnicos = Array.from(
    new Set(data.map((d) => (d.fornecedor ?? "").trim()).filter((f) => f.length > 0)),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const sugestoesFornecedor = buscaFornecedor.trim()
    ? fornecedoresUnicos.filter((f) => f.toLowerCase().includes(buscaFornecedor.toLowerCase())).slice(0, 8)
    : [];

  const filtradas = porForma.filter((d) => {
    if (mesSelecionado !== "todos" && d.vencimento.slice(0, 7) !== mesSelecionado) return false;
    if (filtro === "avencer" && (d.pago || d.vencimento < hoje)) return false;
    if (filtro === "vencidas" && (d.pago || d.vencimento >= hoje)) return false;
    if (filtro === "pagas" && !d.pago) return false;
    if (busca && !`${d.descricao} ${d.fornecedor ?? ""}`.toLowerCase().includes(busca.toLowerCase())) return false;
    if (fornecedorSelecionado && (d.fornecedor ?? "").toLowerCase() !== fornecedorSelecionado.toLowerCase()) return false;
    return true;
  });

  // Resumo do fornecedor selecionado
  const resumoFornecedor = fornecedorSelecionado
    ? data
        .filter((d) => (d.fornecedor ?? "").toLowerCase() === fornecedorSelecionado.toLowerCase())
        .reduce(
          (acc, d) => {
            acc.qtd += 1;
            acc.total += Number(d.valor_parcela);
            if (!d.pago) acc.aberto += Number(d.valor_parcela);
            return acc;
          },
          { qtd: 0, total: 0, aberto: 0 },
        )
    : null;

  // IDs de despesas potencialmente duplicadas (mesma descrição+valor no mesmo mês de vencimento)
  const duplicadosIds = findDuplicateIds(
    data.map((d) => ({ id: d.id, descricao: d.descricao, data: d.vencimento, valor: Number(d.valor_parcela) })),
  );

  const togglePago = async (d: Despesa) => {
    const { error } = await supabase
      .from("despesas")
      .update({ pago: !d.pago, data_pagamento: !d.pago ? todayISO() : null })
      .eq("id", d.id);
    if (error) { console.error(error); return toast.error("Não foi possível atualizar a despesa"); }
    toast.success(!d.pago ? "Marcada como paga" : "Marcada como a vencer");
    qc.invalidateQueries({ queryKey: ["despesas"] });
    qc.invalidateQueries({ queryKey: ["despesas-dashboard"] });
  };

  const excluir = async (id: string) => {
    if (!confirm("Excluir esta despesa?")) return;
    const { error } = await supabase.from("despesas").delete().eq("id", id);
    if (error) { console.error(error); return toast.error("Não foi possível excluir a despesa"); }
    toast.success("Excluída");
    qc.invalidateQueries({ queryKey: ["despesas"] });
    qc.invalidateQueries({ queryKey: ["despesas-dashboard"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Despesas</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-1" />Nova
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
      </div>

      {/* Busca por fornecedor com autocomplete */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar fornecedor..."
          value={fornecedorSelecionado ?? buscaFornecedor}
          onChange={(e) => {
            setBuscaFornecedor(e.target.value);
            setFornecedorSelecionado(null);
            setShowSugestoes(true);
          }}
          onFocus={() => setShowSugestoes(true)}
          onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
          className="pl-9 pr-9"
        />
        {(fornecedorSelecionado || buscaFornecedor) && (
          <button
            type="button"
            onClick={() => { setFornecedorSelecionado(null); setBuscaFornecedor(""); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-lg leading-none px-1"
            aria-label="Limpar"
          >
            ×
          </button>
        )}
        {showSugestoes && sugestoesFornecedor.length > 0 && !fornecedorSelecionado && (
          <Card className="absolute z-20 mt-1 w-full max-h-64 overflow-auto p-1 shadow-lg">
            {sugestoesFornecedor.map((f) => {
              const qtd = data.filter((d) => (d.fornecedor ?? "").toLowerCase() === f.toLowerCase()).length;
              return (
                <button
                  key={f}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setFornecedorSelecionado(f);
                    setBuscaFornecedor("");
                    setShowSugestoes(false);
                  }}
                  className="w-full flex justify-between items-center text-left text-sm py-2 px-2 rounded hover:bg-accent"
                >
                  <span className="truncate">{f}</span>
                  <span className="text-xs text-muted-foreground ml-2">{qtd}</span>
                </button>
              );
            })}
          </Card>
        )}
      </div>

      {fornecedorSelecionado && resumoFornecedor && (
        <Card className="p-3 shadow-card border-primary/40">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Fornecedor</p>
              <p className="font-semibold truncate">{fornecedorSelecionado}</p>
            </div>
            <div className="text-right text-xs">
              <p>{resumoFornecedor.qtd} compra{resumoFornecedor.qtd === 1 ? "" : "s"}</p>
              <p className="font-bold text-primary text-sm">{formatBRL(resumoFornecedor.total)}</p>
              {resumoFornecedor.aberto > 0 && (
                <p className="text-muted-foreground">Em aberto: {formatBRL(resumoFornecedor.aberto)}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      <Tabs value={forma} onValueChange={(v: any) => setForma(v)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="boleto">Boleto</TabsTrigger>
          <TabsTrigger value="pix">PIX</TabsTrigger>
          <TabsTrigger value="cartao">Cartão</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={filtro} onValueChange={(v: any) => setFiltro(v)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="avencer">A vencer</TabsTrigger>
          <TabsTrigger value="vencidas">Vencidas</TabsTrigger>
          <TabsTrigger value="pagas">Pagas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Card destacado: mês corrente */}
      <Card className="p-4 shadow-card bg-gradient-primary text-primary-foreground">
        <p className="text-xs opacity-90">A vencer no mês corrente {forma !== "todas" && `(${FORMA_LABEL[forma]})`}</p>
        <p className="text-2xl font-bold mt-1">{formatBRL(totalMesAtual.total)}</p>
        <p className="text-xs opacity-90 mt-0.5">
          {totalMesAtual.qtd} parcela{totalMesAtual.qtd === 1 ? "" : "s"} • {mesAtual.split("-")[1]}/{mesAtual.split("-")[0]}
        </p>
      </Card>

      {mesesOrdenados.length > 0 && (
        <Card className="p-3 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground">
              A vencer por mês {forma !== "todas" && `(${FORMA_LABEL[forma]})`}
            </p>
            <p className="text-xs font-semibold">
              Total: <span className="text-primary">{formatBRL(totalGeralAVencer)}</span>
            </p>
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setMesSelecionado("todos")}
              className={`w-full flex justify-between text-sm py-1.5 px-2 rounded transition-colors ${
                mesSelecionado === "todos" ? "bg-accent" : "hover:bg-accent/50"
              }`}
            >
              <span className="text-muted-foreground">Todos os meses</span>
              <span className="font-bold">{formatBRL(totalGeralAVencer)}</span>
            </button>
            {mesesOrdenados.map(([k, v]) => {
              const [y, m] = k.split("-");
              const isAtual = k === mesAtual;
              const isSel = mesSelecionado === k;
              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => setMesSelecionado(isSel ? "todos" : k)}
                  className={`w-full flex justify-between items-center text-sm py-1.5 px-2 rounded transition-colors ${
                    isSel ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <span className="text-muted-foreground">
                    {m}/{y} • {v.qtd} parc. {isAtual && <span className="text-primary font-semibold">(atual)</span>}
                  </span>
                  <span className="font-bold text-primary">{formatBRL(v.total)}</span>
                </button>
              );
            })}
          </div>
          {mesSelecionado !== "todos" && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Listando apenas {mesSelecionado.split("-")[1]}/{mesSelecionado.split("-")[0]}
            </p>
          )}
        </Card>
      )}

      {isLoading && <p className="text-center text-muted-foreground py-6">Carregando...</p>}

      <div className="space-y-2">
        {filtradas.map((d) => {
          const vencida = !d.pago && d.vencimento < hoje;
          const duplicado = duplicadosIds.has(d.id);
          return (
            <Card
              key={d.id}
              className={`p-3 shadow-card ${duplicado ? "border-amber-500 border-2 bg-amber-50/40 dark:bg-amber-950/20" : ""}`}
            >
              <div className="flex justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2">{d.descricao}</p>
                  <p className="text-xs text-muted-foreground">{d.fornecedor}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge
                      variant={d.pago ? "default" : vencida ? "destructive" : "secondary"}
                      className={d.pago ? "bg-success text-success-foreground" : ""}
                    >
                      {d.pago ? "Pago" : vencida ? "Vencida" : "A vencer"}
                    </Badge>
                    {duplicado && (
                      <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Possível duplicado
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {FORMA_LABEL[d.forma_pagamento ?? "boleto"] ?? d.forma_pagamento}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Venc.: {formatDateBR(d.vencimento)}</span>
                    {d.num_parcelas && d.num_parcelas !== "1" && (
                      <span className="text-xs text-muted-foreground">{d.parcela_atual}/{d.num_parcelas}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatBRL(d.valor_parcela)}</p>
                  <div className="flex gap-1 mt-2 justify-end">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setHistorico(d)} title="Ver histórico">
                      <History className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => togglePago(d)}>
                      <Check className={`h-4 w-4 ${d.pago ? "text-success" : ""}`} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(d); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => excluir(d.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {!isLoading && filtradas.length === 0 && (
          <Card className="p-6 text-center text-muted-foreground">Nenhuma despesa encontrada</Card>
        )}
      </div>

      <DespesaForm open={open} onOpenChange={setOpen} despesa={editing} />

      <HistoricoLancamento
        open={!!historico}
        onOpenChange={(o) => !o && setHistorico(null)}
        tipo="despesa"
        descricao={historico?.descricao ?? ""}
        contraparte={historico?.fornecedor ?? null}
        currentId={historico?.id}
      />
    </div>
  );
}
