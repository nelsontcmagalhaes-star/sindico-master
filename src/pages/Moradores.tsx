import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Building } from "lucide-react";
import { toast } from "sonner";
import MoradorForm from "@/components/MoradorForm";
import FreemiumAddBtn from "@/components/FreemiumAddBtn";
import { usePremium } from "@/hooks/usePremium";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Moradores() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { isPremium } = usePremium();

  const { data = [], isLoading } = useQuery({
    queryKey: ["moradores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("moradores").select("*").order("unidade");
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("moradores").delete().eq("id", deleteId);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Unidade/morador excluído");
    qc.invalidateQueries({ queryKey: ["moradores"] });
    qc.invalidateQueries({ queryKey: ["moradores-count"] });
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Unidades / Moradores</h2>
        <FreemiumAddBtn
          isPremium={isPremium}
          count={data.length}
          label="Novo"
          onClick={() => { setEditing(null); setOpen(true); }}
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : data.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma unidade cadastrada</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.map((m: any) => (
            <Card key={m.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-primary text-xs">{m.unidade}</Badge>
                    <h3 className="font-semibold">{m.responsavel}</h3>
                  </div>
                  {m.telefone && <p className="text-xs text-muted-foreground mt-1">{m.telefone}</p>}
                  {m.observacoes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.observacoes}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(m.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <MoradorForm open={open} onOpenChange={setOpen} morador={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir unidade/morador?</AlertDialogTitle>
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
