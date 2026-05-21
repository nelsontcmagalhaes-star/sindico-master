import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Building2, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";
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
  const [generatedCode, setGeneratedCode] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    document.title = "Entrar - SíndicoMaster";
    if (user) nav("/", { replace: true });
    const seen = localStorage.getItem("sindico_onboarding_seen");
    if (!seen) setShowOnboarding(true);
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
        if (verifyCode !== generatedCode) {
          toast.error("Código incorreto. Tente novamente.");
          setLoading(false);
          return;
        }
        if (!lgpdAccepted) {
          toast.error("Você precisa aceitar a LGPD para continuar.");
          setLoading(false);
          return;
        }

        // Usar fetch direto para evitar problema de headers do supabase-js
        const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
        const supabaseKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

        const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ email: email.trim(), password: pwd }),
        });

        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = result?.msg || result?.error_description || result?.message || "Erro ao criar conta";
          throw new Error(msg);
        }

        toast.success("Conta criada! Verifique seu e-mail para confirmar, depois faça login.");
        setMode("login");

      } else if (mode === "signup") {
        if (!pwd || pwd.length < 6) { toast.error("Senha deve ter ao menos 6 caracteres."); setLoading(false); return; }
        if (pwd !== confirmPwd) { toast.error("As senhas não coincidem."); setLoading(false); return; }
        if (!lgpdAccepted) { toast.error("Aceite a LGPD para continuar."); setLoading(false); return; }
        const code = String(Math.floor(1000 + Math.random() * 9000));
        setGeneratedCode(code);
        toast.info(`Seu código de verificação é: ${code}`, { duration: 30000 });
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
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-center">
                <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-semibold">Código de verificação</p>
                <p className="text-3xl font-bold tracking-[0.3em] text-primary mt-2">{generatedCode}</p>
                <p className="text-muted-foreground text-xs mt-2">Digite o código acima no campo abaixo</p>
              </div>
              <div>
                <Label>Código de 4 dígitos</Label>
                <Input value={verifyCode} onChange={e => setVerifyCode(e.target.value)}
                  className="text-center text-2xl tracking-[0.5em] font-mono" maxLength={4} placeholder="0000" />
              </div>
              <label className="flex items-start gap-2 cursor-pointer bg-muted/50 p-3 rounded-lg border border-border text-xs">
                <input type="checkbox" checked={lgpdAccepted} onChange={e => setLgpdAccepted(e.target.checked)} className="mt-0.5 rounded" />
                <span>Confirmo que li e aceito a <strong>LGPD</strong> — Lei Geral de Proteção de Dados.</span>
              </label>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-gradient-primary py-5 text-base">
            {loading ? "Aguarde..." :
              mode === "login" ? "Entrar" :
              mode === "signup" ? "Enviar código de verificação" :
              mode === "verify" ? "Confirmar e criar conta" :
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
