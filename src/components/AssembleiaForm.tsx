import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props { open: boolean; onOpenChange: (b: boolean) => void; assembleia: any | null; }

const empty = { titulo: "", data: "", horario: "", local: "", observacoes: "" };

export default function AssembleiaForm({ open, onOpenChange, assembleia }: Props) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (assembleia) {
      setF({
        titulo: assembleia.titulo ?? "",
        data: assembleia.data ?? "",
        horario: assembleia.horario ? assembleia.horario.slice(0, 5) : "",
        local: assembleia.local ?? "",
        observacoes: assembleia.observacoes ?? "",
      });
    } else setF(empty);
  }, [assembleia, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.titulo) { toast.error("Título é obrigatório"); return; }
    if (!f.data) { toast.error("Data é obrigatória"); return; }
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const payload = {
        user_id: u.user.id,
        titulo: f.titulo,
        data: f.data,
        horario: f.horario || null,
        local: f.local || null,
        observacoes: f.observacoes || null,
      };
      const { error } = assembleia
        ? await supabase.from("assembleias").update(payload).eq("id", assembleia.id)
        : await supabase.from("assembleias").insert(payload);
      if (error) throw error;
      toast.success(assembleia ? "Assembleia atualizada" : "Assembleia cadastrada");
      qc.invalidateQueries({ queryKey: ["assembleias"] });
      onOpenChange(false);
    } catch (e: any) { toast.error("Erro ao salvar: " + e.message); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{assembleia ? "Editar Assembleia" : "Nova Assembleia"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Título *</Label>
            <Input required value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Ex: Assembleia Ordinária 2025" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Data *</Label>
              <Input type="date" required value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} />
            </div>
            <div>
              <Label>Horário</Label>
              <Input type="time" value={f.horario} onChange={(e) => setF({ ...f, horario: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Local</Label>
            <Input value={f.local} onChange={(e) => setF({ ...f, local: e.target.value })} placeholder="Ex: Salão de Festas do Bloco A" />
          </div>
          <div>
            <Label>Observações / Pauta</Label>
            <Textarea value={f.observacoes} onChange={(e) => setF({ ...f, observacoes: e.target.value })} rows={4} placeholder="Itens da pauta, informações adicionais..." />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-gradient-primary">{saving ? "Salvando..." : "Salvar"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
