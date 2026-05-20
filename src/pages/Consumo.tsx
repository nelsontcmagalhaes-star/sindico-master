import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Flame, Plus, Trash2, Calculator, Save, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { formatBRL, todayISO } from "@/lib/format";

const APTOS_PADRAO = [
  "101","102","201","202","301","302","401","402",
  "501","502","601","602","701","702","801","802",
  "901","902","1001","1002","1101","1102","1201","1202","1300"
];

interface Detalhe {
  unidade: string;
  leitura_anterior: string;
  leitura_atual: string;
}

interface ResultadoItem {
  unidade: string;
  leituraAnterior: number;
  leituraAtual: number;
  consumo: number;
  valor: number;
}

const mesAtual = todayISO().slice(0, 7);

function LeituraTab({ tipo }: { tipo: "gas" | "agua" }) {
  const qc = useQueryClient();
  const [mesRef, setMesRef] = useState(mesAtual);
  const [valorFatura, setValorFatura] = useState("");
  const [detalhes, setDetalhes] = useState<Detalhe[]>(
    APTOS_PADRAO.map(u => ({ unidade: u, leitura_anterior: "", leitura_atual: "" }))
  );
  const [saving, setSaving] = useState(false);
  const [resultado, setResultado] = useState<ResultadoItem[] | null>(null);
  const [showForm, setShowForm] = useState(true);

  // Buscar leitura existente para o mês
  const { data: leituraSalva } = useQuery({
    queryKey: ["leitura", tipo, mesRef],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data: lm } = await supabase
        .from("leituras_mes")
        .select("*, leituras_detalhes(*)")
        .eq("user_id", u.user.id)
        .eq("tipo", tipo)
        .eq("mes_referencia", `${mesRef}-01`)
        .maybeSingle();
      return lm;
    },
  });

  const calcular = () => {
    const fatura = Number(valorFatura.replace(",", "."));
    if (!fatura || fatura <= 0) { toast.error("Informe o valor da fatura"); return; }

    const validos = detalhes
      .filter(d => d.leitura_atual !== "" && d.leitura_anterior !== "")
      .map(d => ({
        unidade: d.unidade,
        leituraAnterior: Number(d.leitura_anterior.replace(",", ".")),
        leituraAtual: Number(d.leitura_atual.replace(",", ".")),
        consumo: Number(d.leitura_atual.replace(",", ".")) - Number(d.leitura_anterior.replace(",", ".")),
        valor: 0,
      }))
      .filter(d => d.consumo > 0);

    if (validos.length === 0) { toast.error("Nenhum consumo encontrado"); return; }

    const totalConsumo = validos.reduce((s, d) => s + d.consumo, 0);
    const precoPorM3 = fatura / totalConsumo;

    const comValor = validos.map(d => ({ ...d, valor: d.consumo * precoPorM3 }));
    setResultado(comValor);
    setShowForm(false);
    toast.success(`Calculado! R$/m³ = ${formatBRL(precoPorM3)}`);
  };

  const salvar = async () => {
    if (!resultado) return;
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");

      // Deleta leitura existente do mesmo mês/tipo se houver
      if (leituraSalva) {
        await supabase.from("leituras_mes").delete().eq("id", leituraSalva.id);
      }

      const { data: lm, error: lmErr } = await supabase.from("leituras_mes").insert({
        user_id: u.user.id,
        tipo,
        mes_referencia: `${mesRef}-01`,
        valor_fatura: Number(valorFatura.replace(",", ".")),
      }).select().single();

      if (lmErr) throw lmErr;

      const detIns = resultado.map(r => ({
        leitura_mes_id: lm.id,
        unidade: r.unidade,
        leitura_anterior: r.leituraAnterior,
        leitura_atual: r.leituraAtual,
        valor_calculado: r.valor,
      }));

      const { error: detErr } = await supabase.from("leituras_detalhes").insert(detIns);
      if (detErr) throw detErr;

      toast.success("Leitura salva com sucesso!");
      qc.invalidateQueries({ queryKey: ["leitura", tipo, mesRef] });
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateDetalhe = (idx: number, field: keyof Detalhe, value: string) => {
    setDetalhes(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const totalConsumo = resultado?.reduce((s, r) => s + r.consumo, 0) ?? 0;
  const totalValor = resultado?.reduce((s, r) => s + r.valor, 0) ?? 0;
  const fatura = Number(valorFatura.replace(",", ".")) || 0;

  const tipoLabel = tipo === "gas" ? "Gás" : "Água";
  const Icon = tipo === "gas" ? Flame : Droplets;

  return (
    <div className="space-y-4">
      {/* Header com mês e fatura */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-sm text-primary">
          <Icon className="h-4 w-4" /> Leitura de {tipoLabel}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Mês de referência</Label>
            <Input type="month" value={mesRef} onChange={e => { setMesRef(e.target.value); setResultado(null); setShowForm(true); }} />
          </div>
          <div>
            <Label>Valor da fatura (R$)</Label>
            <Input placeholder="Ex: 8034,26" value={valorFatura} onChange={e => setValorFatura(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Formulário de leituras */}
      <Card className="p-4">
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-3"
        >
          <span>Leituras por Apartamento ({detalhes.length} unidades)</span>
          {showForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showForm && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase text-muted-foreground px-1">
              <span>Apto</span>
              <span>Leit. Anterior</span>
              <span>Leit. Atual</span>
            </div>
            {detalhes.map((d, i) => (
              <div key={d.unidade} className="grid grid-cols-3 gap-2 items-center">
                <div className="bg-muted rounded px-2 py-1.5 text-sm font-bold text-center">{d.unidade}</div>
                <Input
                  placeholder="0"
                  value={d.leitura_anterior}
                  onChange={e => updateDetalhe(i, "leitura_anterior", e.target.value)}
                  className="text-center h-9"
                />
                <Input
                  placeholder="0"
                  value={d.leitura_atual}
                  onChange={e => updateDetalhe(i, "leitura_atual", e.target.value)}
                  className="text-center h-9"
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Button onClick={calcular} className="w-full bg-gradient-primary">
        <Calculator className="h-4 w-4 mr-2" /> Calcular Rateio
      </Button>

      {/* Resultado */}
      {resultado && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Total consumo</p>
              <p className="font-bold text-sm">{totalConsumo.toFixed(2)} m³</p>
            </Card>
            <Card className="p-3 text-center bg-gradient-primary text-white">
              <p className="text-[10px] opacity-80 uppercase">Fatura total</p>
              <p className="font-bold text-sm">{formatBRL(fatura)}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">R$/m³</p>
              <p className="font-bold text-sm">{totalConsumo > 0 ? formatBRL(fatura / totalConsumo) : "—"}</p>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">Rateio por Unidade</h3>
            <div className="grid grid-cols-4 gap-1 text-[10px] font-bold uppercase text-muted-foreground mb-2 px-1">
              <span>Apto</span><span className="text-center">Anterior</span><span className="text-center">Atual</span><span className="text-right">Valor</span>
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {resultado.map(r => (
                <div key={r.unidade} className="grid grid-cols-4 gap-1 items-center py-1.5 border-b border-border last:border-0 text-sm">
                  <span className="font-bold text-primary">{r.unidade}</span>
                  <span className="text-center text-muted-foreground text-xs">{r.leituraAnterior.toFixed(2)}</span>
                  <span className="text-center text-xs">{r.leituraAtual.toFixed(2)} <span className="text-muted-foreground">(+{r.consumo.toFixed(2)})</span></span>
                  <span className="text-right font-bold text-primary">{formatBRL(r.valor)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-sm mt-3 pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatBRL(totalValor)}</span>
            </div>
          </Card>

          <Button onClick={salvar} disabled={saving} className="w-full bg-gradient-primary">
            <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar Leitura"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Consumo() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Consumo — Gás & Água</h2>
      <p className="text-sm text-muted-foreground">
        Informe as leituras e o sistema calcula o rateio proporcional pela fatura total.
      </p>
      <Tabs defaultValue="agua">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="agua" className="gap-2"><Droplets className="h-4 w-4" />Água</TabsTrigger>
          <TabsTrigger value="gas" className="gap-2"><Flame className="h-4 w-4" />Gás</TabsTrigger>
        </TabsList>
        <TabsContent value="agua" className="mt-4"><LeituraTab tipo="agua" /></TabsContent>
        <TabsContent value="gas" className="mt-4"><LeituraTab tipo="gas" /></TabsContent>
      </Tabs>
    </div>
  );
}
