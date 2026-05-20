import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import ReservaForm from "@/components/ReservaForm";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatDateBR(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function Reservas() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["reservas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservas")
        .select("*, moradores(unidade, responsavel)")
        .order("data", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("reservas").delete().eq("id", deleteId);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Reserva excluída");
    qc.invalidateQueries({ queryKey: ["reservas"] });
    qc.invalidateQueries({ queryKey: ["reservas-count"] });
    setDeleteId(null);
  };

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reservas</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-1" /> Nova
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : data.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma reserva cadastrada</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.map((r: any) => {
            const passada = r.data < hoje;
            return (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-gradient-primary text-xs">{r.area}</Badge>
                      {passada && <Badge variant="secondary" className="text-xs">Passada</Badge>}
                    </div>
                    <p className="font-semibold mt-1">{formatDateBR(r.data)}</p>
                    {r.moradores && (
                      <p className="text-sm text-muted-foreground">
                        {r.moradores.unidade} — {r.moradores.responsavel}
                      </p>
                    )}
                    {r.observacoes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.observacoes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ReservaForm open={open} onOpenChange={setOpen} reserva={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reserva?</AlertDialogTitle>
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
