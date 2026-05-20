import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  despesa: any | null;
}

const empty = {
  descricao: "",
  fornecedor: "",
  data_compra: "",
  valor_total: "",
  num_parcelas: "1",
  parcela_atual: "1",
  valor_parcela: "",
  vencimento: "",
  pago: false,
  data_pagamento: "",
  observacoes: "",
  forma_pagamento: "boleto",
  condominio_id: "",
};

export default function DespesaForm({ open, onOpenChange, despesa }: Props) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const { data: condominios } = useQuery({
    queryKey: ["condominios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("condominios").select("id,nome").order("nome");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (despesa) {
      setF({
        descricao: despesa.descricao ?? "",
        fornecedor: despesa.fornecedor ?? "",
        data_compra: despesa.data_compra ?? "",
        valor_total: String(despesa.valor_total ?? ""),
        num_parcelas: despesa.num_parcelas ?? "1",
        parcela_atual: String(despesa.parcela_atual ?? 1),
        valor_parcela: String(despesa.valor_parcela ?? ""),
        vencimento: despesa.vencimento ?? "",
        pago: !!despesa.pago,
        data_pagamento: despesa.data_pagamento ?? "",
        observacoes: despesa.observacoes ?? "",
        forma_pagamento: despesa.forma_pagamento ?? "boleto",
        condominio_id: despesa.condominio_id ?? "",
      });
    } else setF(empty);
  }, [despesa, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const payload = {
        user_id: u.user.id,
        descricao: f.descricao,
        fornecedor: f.fornecedor || null,
        data_compra: f.data_compra || null,
        valor_total: Number(f.valor_total) || 0,
        num_parcelas: f.num_parcelas || "1",
        parcela_atual: Number(f.parcela_atual) || 1,
        valor_parcela: Number(f.valor_parcela) || 0,
        vencimento: f.vencimento,
        pago: f.pago,
        data_pagamento: f.pago ? (f.data_pagamento || null) : null,
        observacoes: f.observacoes || null,
        forma_pagamento: f.forma_pagamento || "boleto",
        condominio_id: f.condominio_id || null,
      };
      const { error } = despesa
        ? await supabase.from("despesas").update(payload).eq("id", despesa.id)
        : await supabase.from("despesas").insert(payload);
      if (error) throw error;
      toast.success(despesa ? "Atualizada" : "Despesa criada");
      qc.invalidateQueries({ queryKey: ["despesas"] });
      qc.invalidateQueries({ queryKey: ["despesas-dashboard"] });
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error("Não foi possível salvar a despesa");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{despesa ? "Editar despesa" : "Nova despesa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Condomínio</Label>
            <Select value={f.condominio_id || "none"} onValueChange={(v) => setF({ ...f, condominio_id: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem condomínio</SelectItem>
                {condominios?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descrição *</Label>
            <Input required value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} />
          </div>
          <div>
            <Label>Fornecedor</Label>
            <Input value={f.fornecedor} onChange={(e) => setF({ ...f, fornecedor: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Data da compra</Label>
              <Input type="date" value={f.data_compra} onChange={(e) => setF({ ...f, data_compra: e.target.value })} />
            </div>
            <div>
              <Label>Vencimento *</Label>
              <Input type="date" required value={f.vencimento} onChange={(e) => setF({ ...f, vencimento: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Valor total (R$)</Label>
              <Input type="number" step="0.01" value={f.valor_total} onChange={(e) => setF({ ...f, valor_total: e.target.value })} />
            </div>
            <div>
              <Label>Valor parcela (R$) *</Label>
              <Input type="number" step="0.01" required value={f.valor_parcela} onChange={(e) => setF({ ...f, valor_parcela: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Nº parcelas</Label>
              <Input value={f.num_parcelas} onChange={(e) => setF({ ...f, num_parcelas: e.target.value })} />
            </div>
            <div>
              <Label>Parcela atual</Label>
              <Input type="number" value={f.parcela_atual} onChange={(e) => setF({ ...f, parcela_atual: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Forma de pagamento *</Label>
            <Select value={f.forma_pagamento} onValueChange={(v) => setF({ ...f, forma_pagamento: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>Pago</Label>
            <Switch checked={f.pago} onCheckedChange={(v) => setF({ ...f, pago: v })} />
          </div>
          {f.pago && (
            <div>
              <Label>Data de pagamento</Label>
              <Input type="date" value={f.data_pagamento} onChange={(e) => setF({ ...f, data_pagamento: e.target.value })} />
            </div>
          )}
          <div>
            <Label>Observações</Label>
            <Textarea rows={2} value={f.observacoes} onChange={(e) => setF({ ...f, observacoes: e.target.value })} />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-gradient-primary">
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
