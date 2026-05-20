import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Building2, MapPin } from "lucide-react";
import CondominioForm from "@/components/CondominioForm";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Condominios() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { document.title = "Condomínios | Vencix Condomínio"; }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["condominios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("condominios").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("condominios").delete().eq("id", deleteId);
    if (error) { console.error(error); toast.error("Não foi possível excluir o condomínio"); }
    else {
      toast.success("Excluído");
      qc.invalidateQueries({ queryKey: ["condominios"] });
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Condomínios</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-1" /> Novo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : !data?.length ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum condomínio cadastrado</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.map((c: any) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{c.nome}</h3>
                  {c.cnpj && <p className="text-xs text-muted-foreground">CNPJ: {c.cnpj}</p>}
                  {(c.logradouro || c.cidade) && (
                    <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
                      <MapPin className="h-3 w-3 mt-1 shrink-0" />
                      <span>
                        {[c.logradouro, c.numero].filter(Boolean).join(", ")}
                        {c.bairro && ` - ${c.bairro}`}
                        {c.cidade && `, ${c.cidade}`}
                        {c.estado && `/${c.estado}`}
                      </span>
                    </p>
                  )}
                  {c.sindico && <p className="text-xs mt-1">Síndico: {c.sindico}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CondominioForm open={open} onOpenChange={setOpen} condominio={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir condomínio?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
