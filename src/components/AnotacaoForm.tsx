import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import AnexosManager from "@/components/AnexosManager";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  anotacao: any | null;
}

const empty = {
  condominio_id: "",
  mes_referencia: new Date().toISOString().slice(0, 7) + "-01",
  titulo: "",
  conteudo: "",
};

export default function AnotacaoForm({ open, onOpenChange, anotacao }: Props) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(empty);
  const [savedId, setSavedId] = useState<string | null>(null);
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
    if (anotacao) {
      setF({
        condominio_id: anotacao.condominio_id ?? "",
        mes_referencia: anotacao.mes_referencia ?? empty.mes_referencia,
        titulo: anotacao.titulo ?? "",
        conteudo: anotacao.conteudo ?? "",
      });
      setSavedId(anotacao.id);
    } else {
      setF(empty);
      setSavedId(null);
    }
  }, [anotacao, open]);

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
        mes_referencia: f.mes_referencia,
        titulo: f.titulo,
        conteudo: f.conteudo || null,
      };
      if (savedId) {
        const { error } = await supabase.from("anotacoes").update(payload).eq("id", savedId);
        if (error) throw error;
        toast.success("Anotação atualizada");
      } else {
        const { data, error } = await supabase.from("anotacoes").insert(payload).select("id").single();
        if (error) throw error;
        setSavedId(data.id);
        toast.success("Anotação criada — você já pode anexar arquivos");
      }
      qc.invalidateQueries({ queryKey: ["anotacoes"] });
    } catch (err: any) {
      console.error(err);
      toast.error("Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  };

  // Mês input: convert yyyy-mm-dd <-> yyyy-mm
  const mesInput = f.mes_referencia?.slice(0, 7) ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{savedId ? "Editar anotação" : "Nova anotação"}</DialogTitle>
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
            <Label>Mês de referência *</Label>
            <Input
              type="month"
              required
              value={mesInput}
              onChange={(e) => setF({ ...f, mes_referencia: e.target.value + "-01" })}
            />
          </div>
          <div>
            <Label>Título *</Label>
            <Input required placeholder="Ex.: Serviços realizados em março"
              value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} />
          </div>
          <div>
            <Label>Conteúdo</Label>
            <Textarea rows={6} placeholder="Descreva os serviços, ocorrências, observações..."
              value={f.conteudo} onChange={(e) => setF({ ...f, conteudo: e.target.value })} />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-gradient-primary">
            {saving ? "Salvando..." : savedId ? "Atualizar" : "Salvar"}
          </Button>

          <div className="pt-2 border-t border-border">
            <AnexosManager anotacaoId={savedId ?? undefined} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
