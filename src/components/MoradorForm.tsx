import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props { open: boolean; onOpenChange: (b: boolean) => void; morador: any | null; }

const empty = { unidade: "", responsavel: "", telefone: "", observacoes: "" };

export default function MoradorForm({ open, onOpenChange, morador }: Props) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (morador) {
      setF({
        unidade: morador.unidade ?? "",
        responsavel: morador.responsavel ?? "",
        telefone: morador.telefone ?? "",
        observacoes: morador.observacoes ?? "",
      });
    } else setF(empty);
  }, [morador, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.unidade) { toast.error("Unidade é obrigatória"); return; }
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const payload = {
        user_id: u.user.id,
        unidade: f.unidade,
        responsavel: f.responsavel || null,
        telefone: f.telefone || null,
        observacoes: f.observacoes || null,
      };
      const { error } = morador
        ? await supabase.from("moradores").update(payload).eq("id", morador.id)
        : await supabase.from("moradores").insert(payload);
      if (error) throw error;
      toast.success(morador ? "Unidade atualizada" : "Unidade cadastrada");
      qc.invalidateQueries({ queryKey: ["moradores"] });
      qc.invalidateQueries({ queryKey: ["moradores-count"] });
      onOpenChange(false);
    } catch (e: any) { toast.error("Erro ao salvar: " + e.message); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{morador ? "Editar Unidade" : "Nova Unidade"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Unidade / Apartamento *</Label>
            <Input required value={f.unidade} onChange={(e) => setF({ ...f, unidade: e.target.value })} placeholder="Ex: Ap. 101, Casa 5..." />
          </div>
          <div>
            <Label>Responsável / Morador</Label>
            <Input value={f.responsavel} onChange={(e) => setF({ ...f, responsavel: e.target.value })} />
          </div>
          <div>
            <Label>Telefone / WhatsApp</Label>
            <Input value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={f.observacoes} onChange={(e) => setF({ ...f, observacoes: e.target.value })} rows={3} />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-gradient-primary">{saving ? "Salvando..." : "Salvar"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
