import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Building2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import OnboardingSlides from "@/components/OnboardingSlides";

const ADMIN_EMAIL = "nelsontcmagalhaes@gmail.com";

export default function Auth() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "verify">("login");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    document.title = "Entrar - SíndicoMaster";
    const seen = localStorage.getItem("sindico_onboarding_seen");
    if (!seen) setShowOnboarding(true);

    if (user) {
      // Usuário chegou via magic link do e-mail — definir senha se houver pendência
      const pendingPwd = sessionStorage.getItem("sindico_pending_pwd");
      const pendingEmail = sessionStorage.getItem("sindico_pending_email");
      if (pendingPwd && pendingEmail) {
        const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
        const supabaseKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
        supabase.auth.getSession().then(({ data: { session } }) => {
          const token = session?.access_token;
          if (token) {
            fetch(`${supabaseUrl}/auth/v1/user`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "apikey": supabaseKey,
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({ password: pendingPwd }),
            }).finally(() => {
              sessionStorage.removeItem("sindico_pending_pwd");
              sessionStorage.removeItem("sindico_pending_email");
              toast.success("Conta criada com sucesso! Bem-vindo ao SíndicoMaster!");
              nav("/", { replace: true });
            });
          } else {
            sessionStorage.removeItem("sindico_pending_pwd");
            sessionStorage.removeItem("sindico_pending_email");
            nav("/", { replace: true });
          }
        });
      } else {
        nav("/", { replace: true });
      }
    }
  }, [user, nav]);

  const handleOnboardingFinish = () => {
    localStorage.setItem("sindico_onboarding_seen", "1");
    setShowOnboarding(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Link de redefinição enviado para seu e-mail");
        setMode("login");

      } else if (mode === "verify") {
        // Reenviar o link de verificação para o e-mail
        const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
        const supabaseKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
        const pendingEmail = sessionStorage.getItem("sindico_pending_email") || email;

        const otpRes = await fetch(`${supabaseUrl}/auth/v1/otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            email: pendingEmail.trim(),
            create_user: true,
            redirect_to: "https://sindico-master.vercel.app",
          }),
        });

        if (!otpRes.ok) {
          const d = await otpRes.json().catch(() => ({}));
          throw new Error(d?.msg || d?.error_description || d?.message || "Erro ao reenviar");
        }
        toast.success("E-mail reenviado! Verifique sua caixa de entrada.");

      } else if (mode === "signup") {
        if (!pwd || pwd.length < 6) { toast.error("Senha deve ter ao menos 6 caracteres."); setLoading(false); return; }
        if (pwd !== confirmPwd) { toast.error("As senhas não coincidem."); setLoading(false); return; }
        if (!lgpdAccepted) { toast.error("Aceite a LGPD para continuar."); setLoading(false); return; }

        // Salvar senha temporariamente para usar após o clique no link do e-mail
        sessionStorage.setItem("sindico_pending_pwd", pwd);
        sessionStorage.setItem("sindico_pending_email", email.trim());

        // Enviar código OTP real para o e-mail do usuário
        const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
        const supabaseKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

        const otpRes = await fetch(`${supabaseUrl}/auth/v1/otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            create_user: true,
            redirect_to: "https://sindico-master.vercel.app",
          }),
        });

        if (!otpRes.ok) {
          const otpData = await otpRes.json().catch(() => ({}));
          const msg = otpData?.msg || otpData?.error_description || otpData?.message || "Erro ao enviar código";
          sessionStorage.removeItem("sindico_pending_pwd");
          sessionStorage.removeItem("sindico_pending_email");
          throw new Error(msg);
        }

        toast.success("E-mail enviado! Clique no link 'Sign in' que chegou na sua caixa de entrada.");
        setMode("verify");

      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
        toast.success("Bem-vindo ao SíndicoMaster!");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  if (showOnboarding) return <OnboardingSlides onFinish={handleOnboardingFinish} />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-primary">
      <Card className="w-full max-w-md p-8 shadow-elev">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-primary p-4 rounded-2xl mb-3 shadow-card">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">SíndicoMaster</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Entre na sua conta" :
             mode === "signup" ? "Crie sua conta" :
             mode === "verify" ? "Verificar e-mail" :
             "Recuperar senha"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode !== "verify" && (
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
          )}

          {(mode === "login" || mode === "signup") && (
            <div>
              <Label htmlFor="pwd">Senha</Label>
              <div className="relative">
                <Input id="pwd" type={showPwd ? "text" : "password"} required minLength={6}
                  value={pwd} onChange={(e) => setPwd(e.target.value)} className="pr-10" placeholder="Mínimo 6 caracteres" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "login" && (
                <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline mt-1">
                  Esqueci minha senha
                </button>
              )}
            </div>
          )}

          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="confirmPwd">Confirmar senha</Label>
                <div className="relative">
                  <Input id="confirmPwd" type={showPwd ? "text" : "password"} required
                    value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="pr-10" />
                </div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer bg-muted/50 p-3 rounded-lg border border-border text-xs">
                <input type="checkbox" checked={lgpdAccepted} onChange={e => setLgpdAccepted(e.target.checked)}
                  className="mt-0.5 rounded" />
                <span>Li e aceito os termos da <strong>Lei Geral de Proteção de Dados (LGPD)</strong>. Concordo com o armazenamento seguro das minhas informações.</span>
              </label>
            </>
          )}

          {mode === "verify" && (
            <>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-center space-y-2">
                <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-semibold">Verifique seu e-mail</p>
                <p className="text-muted-foreground text-xs">
                  Enviamos um e-mail para <strong>{email}</strong>.
                </p>
                <p className="text-xs font-medium text-primary">
                  Clique no botão <strong>"Sign in"</strong> dentro do e-mail para confirmar e entrar no app automaticamente.
                </p>
                <p className="text-muted-foreground text-xs">Verifique também a pasta de spam.</p>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-gradient-primary py-5 text-base">
            {loading ? "Aguarde..." :
              mode === "login" ? "Entrar" :
              mode === "signup" ? "Enviar código por e-mail" :
              mode === "verify" ? "Reenviar e-mail" :
              "Enviar link de recuperação"}
          </Button>
        </form>

        {mode === "forgot" || mode === "verify" ? (
          <Button variant="ghost" className="w-full mt-3 text-sm" onClick={() => { setMode("login"); setVerifyCode(""); }}>
            Voltar para o login
          </Button>
        ) : (
          <Button variant="ghost" className="w-full mt-3 text-sm"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setLgpdAccepted(false); }}>
            {mode === "login" ? "Não tem conta? Cadastre-se grátis" : "Já tem conta? Entrar"}
          </Button>
        )}

        {mode === "login" && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex flex-col gap-1 text-center">
              {[
                "✓ 1 item grátis em cada módulo",
                "✓ Premium anual: R$ 99,00",
                "✓ Dados seguros com criptografia"
              ].map(t => <p key={t} className="text-xs text-muted-foreground">{t}</p>)}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
