import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Building2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const nav = useNavigate();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Redefinir senha - SíndicoMaster";
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd !== confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      toast.success("Senha atualizada!");
      nav("/", { replace: true });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-primary">
      <Card className="w-full max-w-md p-8 shadow-elev">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-primary p-4 rounded-2xl mb-3 shadow-card">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Redefinir senha</h1>
          <p className="text-sm text-muted-foreground">Defina sua nova senha</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="pwd">Nova senha</Label>
            <div className="relative">
              <Input
                id="pwd"
                type={show ? "text" : "password"}
                required
                minLength={6}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirm">Confirmar senha</Label>
            <Input
              id="confirm"
              type={show ? "text" : "password"}
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-primary">
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
