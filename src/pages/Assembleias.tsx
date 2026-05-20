import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import AssembleiaForm from "@/components/AssembleiaForm";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatDateBR(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function Assembleias() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["assembleias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assembleias")
        .select("*")
        .order("data", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("assembleias").delete().eq("id", deleteId);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Assembleia excluída");
    qc.invalidateQueries({ queryKey: ["assembleias"] });
    setDeleteId(null);
  };

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Assembleias</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-1" /> Nova
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : data.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma assembleia cadastrada</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.map((a: any) => {
            const futura = a.data >= hoje;
            return (
              <Card key={a.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className={futura ? "bg-gradient-primary text-xs" : "text-xs"} variant={futura ? "default" : "secondary"}>
                        {futura ? "Agendada" : "Realizada"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{a.titulo}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDateBR(a.data)}{a.horario ? ` às ${a.horario.slice(0, 5)}` : ""}
                    </p>
                    {a.local && <p className="text-xs text-muted-foreground mt-0.5">{a.local}</p>}
                    {a.observacoes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.observacoes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(a.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AssembleiaForm open={open} onOpenChange={setOpen} assembleia={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir assembleia?</AlertDialogTitle>
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
