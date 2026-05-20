import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  condominio: any | null;
}

const empty = {
  nome: "", cnpj: "", cep: "", logradouro: "", numero: "", complemento: "",
  bairro: "", cidade: "", estado: "", pais: "Brasil",
  sindico: "", telefone: "", email: "", observacoes: "",
};

export default function CondominioForm({ open, onOpenChange, condominio }: Props) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (condominio) {
      setF({ ...empty, ...condominio });
    } else setF(empty);
  }, [condominio, open]);

  const buscarCep = async (cepRaw: string) => {
    const cep = cepRaw.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await r.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }
      setF((prev: any) => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
        pais: "Brasil",
      }));
      toast.success("Endereço preenchido");
    } catch {
      toast.error("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const payload = {
        user_id: u.user.id,
        nome: f.nome,
        cnpj: f.cnpj || null,
        cep: f.cep || null,
        logradouro: f.logradouro || null,
        numero: f.numero || null,
        complemento: f.complemento || null,
        bairro: f.bairro || null,
        cidade: f.cidade || null,
        estado: f.estado || null,
        pais: f.pais || "Brasil",
        sindico: f.sindico || null,
        telefone: f.telefone || null,
        email: f.email || null,
        observacoes: f.observacoes || null,
      };
      const { error } = condominio
        ? await supabase.from("condominios").update(payload).eq("id", condominio.id)
        : await supabase.from("condominios").insert(payload);
      if (error) throw error;
      toast.success(condominio ? "Atualizado" : "Condomínio criado");
      qc.invalidateQueries({ queryKey: ["condominios"] });
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error("Não foi possível salvar o condomínio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{condominio ? "Editar condomínio" : "Novo condomínio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Nome *</Label>
            <Input required value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
          </div>
          <div>
            <Label>CNPJ</Label>
            <Input value={f.cnpj} onChange={(e) => setF({ ...f, cnpj: e.target.value })} />
          </div>
          <div>
            <Label>CEP</Label>
            <div className="relative">
              <Input
                value={f.cep}
                placeholder="00000-000"
                inputMode="numeric"
                maxLength={9}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
                  const masked = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
                  setF((prev: any) => ({ ...prev, cep: masked }));
                  if (raw.length === 8) buscarCep(raw);
                }}
                onBlur={(e) => buscarCep(e.target.value)}
              />
              {cepLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Digite o CEP para preencher automaticamente</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Label>Logradouro</Label>
              <Input value={f.logradouro} onChange={(e) => setF({ ...f, logradouro: e.target.value })} />
            </div>
            <div>
              <Label>Número</Label>
              <Input value={f.numero} onChange={(e) => setF({ ...f, numero: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Complemento</Label>
            <Input value={f.complemento} onChange={(e) => setF({ ...f, complemento: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Bairro</Label>
              <Input value={f.bairro} onChange={(e) => setF({ ...f, bairro: e.target.value })} />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={f.cidade} onChange={(e) => setF({ ...f, cidade: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Estado</Label>
              <Input value={f.estado} onChange={(e) => setF({ ...f, estado: e.target.value })} />
            </div>
            <div>
              <Label>País</Label>
              <Input value={f.pais} onChange={(e) => setF({ ...f, pais: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Síndico</Label>
            <Input value={f.sindico} onChange={(e) => setF({ ...f, sindico: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Telefone</Label>
              <Input value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </div>
          </div>
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
