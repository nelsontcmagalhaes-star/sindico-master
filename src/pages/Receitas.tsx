import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, TrendingUp, CheckCircle2, AlertTriangle, History } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import ReceitaForm from "@/components/ReceitaForm";
import HistoricoLancamento from "@/components/HistoricoLancamento";
import FreemiumAddBtn from "@/components/FreemiumAddBtn";
import { usePremium } from "@/hooks/usePremium";
import { formatBRL } from "@/lib/format";
import { findDuplicateIds } from "@/lib/duplicates";

const categoriaLabel: Record<string, string> = {
  taxa_condominial: "Taxa condominial",
  taxa_extra: "Taxa extra",
  multa: "Multa",
  aluguel_area_comum: "Aluguel área comum",
  outros: "Outros",
};

export default function Receitas() {
  useEffect(() => { document.title = "Receitas | SíndicoMaster"; }, []);

  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [historico, setHistorico] = useState<any | null>(null);
  const { isPremium } = usePremium();

  const { data: receitas = [], isLoading } = useQuery({
    queryKey: ["receitas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receitas")
        .select("*, condominios(nome)")
        .order("data_recebimento", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("receitas").delete().eq("id", deleteId);
    if (error) { console.error(error); toast.error("Não foi possível excluir a receita"); return; }
    toast.success("Receita excluída");
    qc.invalidateQueries({ queryKey: ["receitas"] });
    setDeleteId(null);
  };

  const total = receitas.reduce((s, r) => s + Number(r.valor || 0), 0);
  const recebido = receitas.filter(r => r.recebido).reduce((s, r) => s + Number(r.valor || 0), 0);
  const aReceber = total - recebido;

  const duplicadosIds = findDuplicateIds(
    receitas.map((r) => ({ id: r.id, descricao: r.descricao, data: r.data_recebimento, valor: Number(r.valor) })),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Receitas</h2>
          <p className="text-sm text-muted-foreground">Entradas financeiras dos condomínios</p>
        </div>
        <FreemiumAddBtn
          isPremium={isPremium}
          count={receitas.length}
          label="Nova"
          onClick={() => { setEditing(null); setOpen(true); }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-bold text-sm">{formatBRL(total)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Recebido</p>
          <p className="font-bold text-sm text-green-600">{formatBRL(recebido)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">A receber</p>
          <p className="font-bold text-sm text-amber-600">{formatBRL(aReceber)}</p>
        </Card>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">Carregando...</p>
      ) : receitas.length === 0 ? (
        <Card className="p-8 text-center">
          <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhuma receita cadastrada</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {receitas.map((r) => {
            const duplicado = duplicadosIds.has(r.id);
            return (
            <Card
              key={r.id}
              className={`p-4 ${duplicado ? "border-amber-500 border-2 bg-amber-50/40 dark:bg-amber-950/20" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{r.descricao}</h3>
                    {r.recebido && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Recebido
                      </Badge>
                    )}
                    {duplicado && (
                      <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Possível duplicado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.condominios?.nome ?? "—"} · {categoriaLabel[r.categoria]}
                    {r.categoria === "taxa_extra" && r.num_parcelas && ` · ${r.parcela_atual ?? 1}/${r.num_parcelas}`}
                    {r.pagador && ` · ${r.pagador}`}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-bold text-lg">{formatBRL(Number(r.valor))}</span>
                    <Badge variant="outline">
                      {new Date(r.data_recebimento + "T00:00").toLocaleDateString("pt-BR")}
                    </Badge>
                  </div>
                  {r.observacoes && (
                    <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{r.observacoes}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setHistorico(r)} title="Ver histórico">
                    <History className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}

      <ReceitaForm open={open} onOpenChange={setOpen} receita={editing} />

      <HistoricoLancamento
        open={!!historico}
        onOpenChange={(o) => !o && setHistorico(null)}
        tipo="receita"
        descricao={historico?.descricao ?? ""}
        contraparte={historico?.pagador ?? null}
        currentId={historico?.id}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
