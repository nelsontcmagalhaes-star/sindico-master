import { useEffect, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props { open: boolean; onOpenChange: (b: boolean) => void; reserva: any | null; }

const AREAS = ["Salão de Festas", "Churrasqueira", "Quadra Esportiva", "Piscina", "Academia", "Sala de Reuniões"];

const empty = { area: "", data: "", morador_id: "", observacoes: "" };

export default function ReservaForm({ open, onOpenChange, reserva }: Props) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const { data: moradores = [] } = useQuery({
    queryKey: ["moradores-select"],
    queryFn: async () => {
      const { data, error } = await supabase.from("moradores").select("id, unidade, responsavel").order("unidade");
      if (error) return [];
      return data ?? [];
    },
  });

  useEffect(() => {
    if (reserva) {
      setF({
        area: reserva.area ?? "",
        data: reserva.data ?? "",
        morador_id: reserva.morador_id ?? "",
        observacoes: reserva.observacoes ?? "",
      });
    } else setF(empty);
  }, [reserva, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.area) { toast.error("Área é obrigatória"); return; }
    if (!f.data) { toast.error("Data é obrigatória"); return; }
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const payload = {
        user_id: u.user.id,
        area: f.area,
        data: f.data,
        morador_id: f.morador_id || null,
        observacoes: f.observacoes || null,
      };
      const { error } = reserva
        ? await supabase.from("reservas").update(payload).eq("id", reserva.id)
        : await supabase.from("reservas").insert(payload);
      if (error) throw error;
      toast.success(reserva ? "Reserva atualizada" : "Reserva cadastrada");
      qc.invalidateQueries({ queryKey: ["reservas"] });
      qc.invalidateQueries({ queryKey: ["reservas-count"] });
      onOpenChange(false);
    } catch (e: any) { toast.error("Erro ao salvar: " + e.message); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{reserva ? "Editar Reserva" : "Nova Reserva"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Área *</Label>
            <Select value={f.area} onValueChange={(v) => setF({ ...f, area: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a área" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data *</Label>
            <Input type="date" required value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} />
          </div>
          <div>
            <Label>Unidade / Morador</Label>
            <Select value={f.morador_id} onValueChange={(v) => setF({ ...f, morador_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o morador (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {moradores.map((m: any) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.unidade}{m.responsavel ? ` — ${m.responsavel}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
