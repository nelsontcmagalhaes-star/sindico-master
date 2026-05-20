import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Building2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Entrar - SíndicoMaster";
    if (user) nav("/", { replace: true });
  }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Enviamos um link de redefinição para seu e-mail");
        setMode("login");
      } else if (mode === "signup") {
        const redirect = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email, password: pwd,
          options: { emailRedirectTo: redirect },
        });
        if (error) throw error;
        toast.success("Conta criada!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
        toast.success("Bem-vindo!");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  const subtitle =
    mode === "login" ? "Entre na sua conta" :
    mode === "signup" ? "Crie sua conta" :
    "Recuperar senha";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-primary">
      <Card className="w-full max-w-md p-8 shadow-elev">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-primary p-4 rounded-2xl mb-3 shadow-card">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">SíndicoMaster</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== "forgot" && (
            <div>
              <Label htmlFor="pwd">Senha</Label>
              <div className="relative">
                <Input
                  id="pwd"
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={6}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-primary hover:underline mt-2"
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-gradient-primary">
            {loading ? "Aguarde..." :
              mode === "login" ? "Entrar" :
              mode === "signup" ? "Criar conta" :
              "Enviar link de recuperação"}
          </Button>
        </form>
        {mode === "forgot" ? (
          <Button variant="ghost" className="w-full mt-4 text-sm" onClick={() => setMode("login")}>
            Voltar para o login
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="w-full mt-4 text-sm"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
          </Button>
        )}
      </Card>
    </div>
  );
}
