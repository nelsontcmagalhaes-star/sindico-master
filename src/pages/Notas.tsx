import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, CheckCircle2, Calendar as CalendarIcon, Wrench, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import AnotacaoForm from "@/components/AnotacaoForm";
import ManutencaoForm from "@/components/ManutencaoForm";
import FreemiumAddBtn from "@/components/FreemiumAddBtn";
import { usePremium } from "@/hooks/usePremium";
import { addPeriodicidade, PERIODICIDADE_LABEL, Periodicidade } from "@/lib/periodicidade";

const fmtDate = (s?: string | null) => s ? new Date(s + "T00:00:00").toLocaleDateString("pt-BR") : "—";
const fmtMes = (s: string) => new Date(s + "T00:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

export default function Notas() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("anotacoes");
  const [openA, setOpenA] = useState(false);
  const [openM, setOpenM] = useState(false);
  const [editA, setEditA] = useState<any>(null);
  const [editM, setEditM] = useState<any>(null);
  const { isPremium } = usePremium();

  const { data: anotacoes = [] } = useQuery({
    queryKey: ["anotacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anotacoes")
        .select("*, condominios(nome)")
        .order("mes_referencia", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: manutencoes = [] } = useQuery({
    queryKey: ["manutencoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manutencoes")
        .select("*, condominios(nome)")
        .order("proxima_data", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const delAnot = async (id: string) => {
    if (!confirm("Excluir esta anotação? Anexos também serão removidos.")) return;
    const { error } = await supabase.from("anotacoes").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Anotação excluída");
    qc.invalidateQueries({ queryKey: ["anotacoes"] });
  };

  const delMan = async (id: string) => {
    if (!confirm("Excluir esta manutenção? Anexos também serão removidos.")) return;
    const { error } = await supabase.from("manutencoes").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Manutenção excluída");
    qc.invalidateQueries({ queryKey: ["manutencoes"] });
  };

  const concluir = async (m: any) => {
    const hoje = new Date().toISOString().slice(0, 10);
    const prox = addPeriodicidade(hoje, m.periodicidade as Periodicidade);
    const { error } = await supabase.from("manutencoes").update({
      ultima_execucao: hoje,
      proxima_data: m.periodicidade === "unica" ? m.proxima_data : prox,
      ativo: m.periodicidade !== "unica",
    }).eq("id", m.id);
    if (error) { toast.error("Erro ao concluir"); return; }
    toast.success("Manutenção concluída");
    qc.invalidateQueries({ queryKey: ["manutencoes"] });
  };

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="anotacoes" className="gap-2"><NotebookPen className="h-4 w-4" />Anotações</TabsTrigger>
          <TabsTrigger value="manutencoes" className="gap-2"><Wrench className="h-4 w-4" />Manutenções</TabsTrigger>
        </TabsList>

        <TabsContent value="anotacoes" className="space-y-3 mt-4">
          <FreemiumAddBtn
            isPremium={isPremium}
            count={anotacoes.length}
            label="Nova anotação"
            className="w-full"
            onClick={() => { setEditA(null); setOpenA(true); }}
          />
          {anotacoes.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">Nenhuma anotação ainda.</p>
          ) : anotacoes.map((a: any) => (
            <Card key={a.id} className="p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{a.titulo}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {a.condominios?.nome} • {fmtMes(a.mes_referencia)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditA(a); setOpenA(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => delAnot(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {a.conteudo && <p className="text-sm text-foreground/80 whitespace-pre-wrap">{a.conteudo}</p>}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="manutencoes" className="space-y-3 mt-4">
          <FreemiumAddBtn
            isPremium={isPremium}
            count={manutencoes.length}
            label="Nova manutenção"
            className="w-full"
            onClick={() => { setEditM(null); setOpenM(true); }}
          />
          {manutencoes.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">Nenhuma manutenção cadastrada.</p>
          ) : manutencoes.map((m: any) => {
            const atrasada = m.ativo && m.proxima_data < hoje;
            return (
              <Card key={m.id} className={`p-3 space-y-1 ${atrasada ? "border-destructive/60 bg-destructive/5" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{m.titulo}</p>
                      <Badge variant="secondary">{PERIODICIDADE_LABEL[m.periodicidade as Periodicidade]}</Badge>
                      {!m.ativo && <Badge variant="outline">Inativa</Badge>}
                      {atrasada && <Badge variant="destructive">Atrasada</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.condominios?.nome}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Concluir" onClick={() => concluir(m)}>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditM(m); setOpenM(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => delMan(m.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-1"><CalendarIcon className="h-3 w-3" />Próxima: {fmtDate(m.proxima_data)}</span>
                  {m.ultima_execucao && <span>Última: {fmtDate(m.ultima_execucao)}</span>}
                  {m.responsavel && <span>• {m.responsavel}</span>}
                </div>
                {m.descricao && <p className="text-sm text-foreground/80 whitespace-pre-wrap">{m.descricao}</p>}
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      <AnotacaoForm open={openA} onOpenChange={setOpenA} anotacao={editA} />
      <ManutencaoForm open={openM} onOpenChange={setOpenM} manutencao={editM} />
    </div>
  );
}
