import { useState } from "react";
import { Lock, CheckCircle2, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  children: React.ReactNode;
  featureName?: string;
  isPremium: boolean;
}

export default function PremiumGate({ children, featureName, isPremium }: Props) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (isPremium) return <>{children}</>;

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none opacity-30 select-none">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 rounded-xl backdrop-blur-sm">
          <Lock className="h-8 w-8 text-primary" />
          <p className="text-sm font-semibold text-center px-4">
            {featureName ? `"${featureName}" requer` : "Este recurso requer"} o plano Premium
          </p>
          <Button onClick={() => setShowUpgrade(true)} className="bg-gradient-primary">
            Assinar Premium — R$ 99/ano
          </Button>
        </div>
      </div>

      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center flex flex-col items-center gap-2">
              <div className="bg-gradient-primary p-3 rounded-full">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              Assinar SíndicoMaster Premium
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-primary text-white rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">R$ 99,00</p>
              <p className="text-sm opacity-80 mt-1">por ano · acesso completo</p>
            </div>

            <div className="space-y-2 text-sm">
              {["Funcionários ilimitados","Moradores/Unidades ilimitados","Despesas e Receitas ilimitadas","Leituras de Gás e Água","Relatórios e exportação CSV","Reservas e Assembleias","Manutenções preventivas"].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="bg-muted rounded-xl p-4 text-center space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Pague via PIX</p>
              <p className="font-bold text-lg">85998251219</p>
              <p className="text-xs text-muted-foreground">Chave: Celular · Nelson Tomaz</p>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Após o pagamento, envie o comprovante via WhatsApp para <strong>(85) 99825-1219</strong> e seu acesso será liberado em até 24h.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setShowUpgrade(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
