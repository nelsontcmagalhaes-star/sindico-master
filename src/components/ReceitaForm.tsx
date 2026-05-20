import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  receita: any | null;
}

const empty = {
  condominio_id: "",
  descricao: "",
  valor: "",
  data_recebimento: new Date().toISOString().slice(0, 10),
  data_recebido: "",
  categoria: "outros" as "taxa_condominial" | "taxa_extra" | "multa" | "aluguel_area_comum" | "outros",
  pagador: "",
  recebido: false,
  parcela_atual: "",
  num_parcelas: "",
  observacoes: "",
};

export default function ReceitaForm({ open, onOpenChange, receita }: Props) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const { data: condominios = [] } = useQuery({
    queryKey: ["condominios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("condominios").select("id, nome").order("nome");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (receita) {
      setF({
        condominio_id: receita.condominio_id ?? "",
        descricao: receita.descricao ?? "",
        valor: String(receita.valor ?? ""),
        data_recebimento: receita.data_recebimento ?? new Date().toISOString().slice(0, 10),
        data_recebido: receita.data_recebido ?? "",
        categoria: receita.categoria ?? "outros",
        pagador: receita.pagador ?? "",
        recebido: !!receita.recebido,
        parcela_atual: receita.parcela_atual != null ? String(receita.parcela_atual) : "",
        num_parcelas: receita.num_parcelas != null ? String(receita.num_parcelas) : "",
        observacoes: receita.observacoes ?? "",
      });
    } else setF(empty);
  }, [receita, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.condominio_id) { toast.error("Selecione um condomínio"); return; }
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const payload = {
        user_id: u.user.id,
        condominio_id: f.condominio_id,
        descricao: f.descricao,
        valor: Number(f.valor) || 0,
        data_recebimento: f.data_recebimento,
        data_recebido: f.recebido ? (f.data_recebido || f.data_recebimento) : null,
        categoria: f.categoria,
        pagador: f.pagador || null,
        recebido: f.recebido,
        parcela_atual: f.categoria === "taxa_extra" && f.parcela_atual ? Number(f.parcela_atual) : null,
        num_parcelas: f.categoria === "taxa_extra" && f.num_parcelas ? Number(f.num_parcelas) : null,
        observacoes: f.observacoes || null,
      };
      const { error } = receita
        ? await supabase.from("receitas").update(payload).eq("id", receita.id)
        : await supabase.from("receitas").insert(payload);
      if (error) throw error;
      toast.success(receita ? "Atualizada" : "Receita criada");
      qc.invalidateQueries({ queryKey: ["receitas"] });
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error("Não foi possível salvar a receita");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{receita ? "Editar receita" : "Nova receita"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Condomínio *</Label>
            <Select value={f.condominio_id} onValueChange={(v) => setF({ ...f, condominio_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {condominios.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descrição *</Label>
            <Input required value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Valor (R$) *</Label>
              <Input type="number" step="0.01" required value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={f.categoria} onValueChange={(v) => setF({ ...f, categoria: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="taxa_condominial">Taxa condominial</SelectItem>
                  <SelectItem value="taxa_extra">Taxa extra</SelectItem>
                  <SelectItem value="multa">Multa</SelectItem>
                  <SelectItem value="aluguel_area_comum">Aluguel área comum</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {f.categoria === "taxa_extra" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Parcela atual</Label>
                <Input type="number" min="1" placeholder="Ex: 3" value={f.parcela_atual} onChange={(e) => setF({ ...f, parcela_atual: e.target.value })} />
              </div>
              <div>
                <Label>Total de parcelas</Label>
                <Input type="number" min="1" placeholder="Ex: 10" value={f.num_parcelas} onChange={(e) => setF({ ...f, num_parcelas: e.target.value })} />
              </div>
            </div>
          )}
          <div>
            <Label>Pagador / Origem</Label>
            <Input value={f.pagador} onChange={(e) => setF({ ...f, pagador: e.target.value })} />
          </div>
          <div>
            <Label>Data prevista de recebimento *</Label>
            <Input type="date" required value={f.data_recebimento} onChange={(e) => setF({ ...f, data_recebimento: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="recebido" checked={f.recebido} onCheckedChange={(c) => setF({ ...f, recebido: !!c })} />
            <Label htmlFor="recebido" className="cursor-pointer">Já recebido</Label>
          </div>
          {f.recebido && (
            <div>
              <Label>Data do recebimento</Label>
              <Input type="date" value={f.data_recebido} onChange={(e) => setF({ ...f, data_recebido: e.target.value })} />
            </div>
          )}
          <div>
            <Label>Observações</Label>
            <Textarea rows={3} value={f.observacoes} onChange={(e) => setF({ ...f, observacoes: e.target.value })} />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-gradient-primary">
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
