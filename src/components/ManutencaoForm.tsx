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
import AnexosManager from "@/components/AnexosManager";
import { PERIODICIDADE_LABEL, Periodicidade } from "@/lib/periodicidade";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  manutencao: any | null;
}

const empty = {
  condominio_id: "",
  titulo: "",
  descricao: "",
  periodicidade: "mensal" as Periodicidade,
  proxima_data: new Date().toISOString().slice(0, 10),
  ultima_execucao: "",
  responsavel: "",
  ativo: true,
};

export default function ManutencaoForm({ open, onOpenChange, manutencao }: Props) {
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
    if (manutencao) {
      setF({
        condominio_id: manutencao.condominio_id ?? "",
        titulo: manutencao.titulo ?? "",
        descricao: manutencao.descricao ?? "",
        periodicidade: manutencao.periodicidade ?? "mensal",
        proxima_data: manutencao.proxima_data ?? empty.proxima_data,
        ultima_execucao: manutencao.ultima_execucao ?? "",
        responsavel: manutencao.responsavel ?? "",
        ativo: manutencao.ativo ?? true,
      });
      setSavedId(manutencao.id);
    } else {
      setF(empty);
      setSavedId(null);
    }
  }, [manutencao, open]);

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
        titulo: f.titulo,
        descricao: f.descricao || null,
        periodicidade: f.periodicidade,
        proxima_data: f.proxima_data,
        ultima_execucao: f.ultima_execucao || null,
        responsavel: f.responsavel || null,
        ativo: f.ativo,
      };
      if (savedId) {
        const { error } = await supabase.from("manutencoes").update(payload).eq("id", savedId);
        if (error) throw error;
        toast.success("Manutenção atualizada");
      } else {
        const { data, error } = await supabase.from("manutencoes").insert(payload).select("id").single();
        if (error) throw error;
        setSavedId(data.id);
        toast.success("Manutenção criada — você já pode anexar arquivos");
      }
      qc.invalidateQueries({ queryKey: ["manutencoes"] });
    } catch (err: any) {
      console.error(err);
      toast.error("Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{savedId ? "Editar manutenção" : "Nova manutenção"}</DialogTitle>
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
            <Label>Título *</Label>
            <Input required placeholder="Ex.: Limpeza da caixa d'água"
              value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea rows={3} placeholder="Detalhes do procedimento, fornecedor sugerido..."
              value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Periodicidade *</Label>
              <Select value={f.periodicidade} onValueChange={(v) => setF({ ...f, periodicidade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PERIODICIDADE_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Próxima data *</Label>
              <Input type="date" required value={f.proxima_data}
                onChange={(e) => setF({ ...f, proxima_data: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Última execução</Label>
            <Input type="date" value={f.ultima_execucao}
              onChange={(e) => setF({ ...f, ultima_execucao: e.target.value })} />
          </div>
          <div>
            <Label>Responsável</Label>
            <Input placeholder="Empresa ou pessoa responsável" value={f.responsavel}
              onChange={(e) => setF({ ...f, responsavel: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="ativo" checked={f.ativo} onCheckedChange={(c) => setF({ ...f, ativo: !!c })} />
            <Label htmlFor="ativo" className="cursor-pointer">Ativo no cronograma</Label>
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-gradient-primary">
            {saving ? "Salvando..." : savedId ? "Atualizar" : "Salvar"}
          </Button>

          <div className="pt-2 border-t border-border">
            <AnexosManager manutencaoId={savedId ?? undefined} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
