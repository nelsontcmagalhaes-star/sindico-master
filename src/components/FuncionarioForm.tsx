import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props { open: boolean; onOpenChange: (b: boolean) => void; funcionario: any | null; }

const empty = { nome: "", cargo: "", telefone: "", cpf: "", data_admissao: "", salario: "", horas_extras: "", endereco: "", bairro: "", cidade: "", estado: "", observacoes: "" };

export default function FuncionarioForm({ open, onOpenChange, funcionario }: Props) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (funcionario) {
      setF({
        nome: funcionario.nome ?? "",
        cargo: funcionario.cargo ?? "",
        telefone: funcionario.telefone ?? "",
        cpf: funcionario.cpf ?? "",
        data_admissao: funcionario.data_admissao ?? "",
        salario: funcionario.salario ? String(funcionario.salario) : "",
        horas_extras: funcionario.horas_extras ? String(funcionario.horas_extras) : "",
        endereco: funcionario.endereco ?? "",
        bairro: funcionario.bairro ?? "",
        cidade: funcionario.cidade ?? "",
        estado: funcionario.estado ?? "",
        observacoes: funcionario.observacoes ?? "",
      });
    } else setF(empty);
  }, [funcionario, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.nome) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const payload = {
        user_id: u.user.id,
        nome: f.nome,
        cargo: f.cargo || null,
        telefone: f.telefone || null,
        cpf: f.cpf || null,
        data_admissao: f.data_admissao || null,
        salario: f.salario ? Number(f.salario) : null,
        horas_extras: f.horas_extras ? Number(f.horas_extras) : null,
        endereco: f.endereco || null,
        bairro: f.bairro || null,
        cidade: f.cidade || null,
        estado: f.estado || null,
        observacoes: f.observacoes || null,
      };
      const { error } = funcionario
        ? await supabase.from("funcionarios").update(payload).eq("id", funcionario.id)
        : await supabase.from("funcionarios").insert(payload);
      if (error) throw error;
      toast.success(funcionario ? "Funcionário atualizado" : "Funcionário cadastrado");
      qc.invalidateQueries({ queryKey: ["funcionarios"] });
      qc.invalidateQueries({ queryKey: ["funcionarios-count"] });
      onOpenChange(false);
    } catch (e: any) { toast.error("Erro ao salvar: " + e.message); } finally { setSaving(false); }
  };

  const field = (label: string, key: string, type = "text", required = false) => (
    <div key={key}>
      <Label>{label}{required && " *"}</Label>
      <Input type={type} required={required} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{funcionario ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {field("Nome Completo", "nome", "text", true)}
          <div className="grid grid-cols-2 gap-2">
            {field("Cargo / Função", "cargo")}
            {field("Telefone / WhatsApp", "telefone")}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {field("CPF", "cpf")}
            {field("Data de Admissão", "data_admissao", "date")}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {field("Salário Base (R$)", "salario", "number")}
            {field("Valor Hora Extra (R$)", "horas_extras", "number")}
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">Endereço</p>
          {field("Rua, Número", "endereco")}
          <div className="grid grid-cols-2 gap-2">
            {field("Bairro", "bairro")}
            {field("Cidade", "cidade")}
          </div>
          {field("Estado (UF)", "estado")}
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
