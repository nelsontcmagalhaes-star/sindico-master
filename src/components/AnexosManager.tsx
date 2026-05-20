import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Paperclip, Trash2, Download, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  /** Either anotacao_id or manutencao_id must be provided */
  anotacaoId?: string;
  manutencaoId?: string;
}

const ACCEPT = "application/pdf,image/jpeg,image/png,image/jpg";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

interface Anexo {
  id: string;
  storage_path: string;
  nome_arquivo: string;
  mime_type: string | null;
  tamanho: number | null;
}

export default function AnexosManager({ anotacaoId, manutencaoId }: Props) {
  const [items, setItems] = useState<Anexo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!anotacaoId && !manutencaoId) return;
    setLoading(true);
    let q = supabase.from("anexos").select("*").order("created_at", { ascending: false });
    q = anotacaoId ? q.eq("anotacao_id", anotacaoId) : q.eq("manutencao_id", manutencaoId!);
    const { data, error } = await q;
    if (!error) setItems((data as Anexo[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [anotacaoId, manutencaoId]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) { toast.error("Arquivo acima de 10 MB"); return; }
    if (!ACCEPT.split(",").includes(file.type)) { toast.error("Apenas PDF, JPG ou PNG"); return; }

    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const folder = anotacaoId ? `anotacoes/${anotacaoId}` : `manutencoes/${manutencaoId}`;
      const path = `${u.user.id}/${folder}/${Date.now()}-${file.name}`;
      const up = await supabase.storage.from("anexos").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { error: insErr } = await supabase.from("anexos").insert({
        user_id: u.user.id,
        anotacao_id: anotacaoId ?? null,
        manutencao_id: manutencaoId ?? null,
        storage_path: path,
        nome_arquivo: file.name,
        mime_type: file.type,
        tamanho: file.size,
      });
      if (insErr) throw insErr;
      toast.success("Anexo enviado");
      load();
    } catch (err: any) {
      console.error(err);
      toast.error("Falha no upload");
    } finally {
      setUploading(false);
    }
  };

  const onDownload = async (a: Anexo) => {
    const { data, error } = await supabase.storage.from("anexos").createSignedUrl(a.storage_path, 60);
    if (error || !data) { toast.error("Não foi possível abrir"); return; }
    window.open(data.signedUrl, "_blank");
  };

  const onDelete = async (a: Anexo) => {
    if (!confirm(`Excluir "${a.nome_arquivo}"?`)) return;
    await supabase.storage.from("anexos").remove([a.storage_path]);
    const { error } = await supabase.from("anexos").delete().eq("id", a.id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Anexo removido");
    load();
  };

  if (!anotacaoId && !manutencaoId) {
    return <p className="text-xs text-muted-foreground">Salve o registro para anexar arquivos.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Anexos</span>
        <label className="inline-flex">
          <input type="file" accept={ACCEPT} className="hidden" onChange={onUpload} disabled={uploading} />
          <Button asChild size="sm" variant="outline" disabled={uploading}>
            <span className="cursor-pointer">
              {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Paperclip className="h-4 w-4 mr-1" />}
              {uploading ? "Enviando..." : "Anexar"}
            </span>
          </Button>
        </label>
      </div>
      {loading ? (
        <p className="text-xs text-muted-foreground">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum anexo. Aceita PDF, JPG, PNG (até 10 MB).</p>
      ) : (
        <ul className="space-y-1">
          {items.map((a) => {
            const isImg = a.mime_type?.startsWith("image/");
            const Icon = isImg ? ImageIcon : FileText;
            return (
              <li key={a.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-1.5">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate flex-1" title={a.nome_arquivo}>{a.nome_arquivo}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onDownload(a)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(a)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
