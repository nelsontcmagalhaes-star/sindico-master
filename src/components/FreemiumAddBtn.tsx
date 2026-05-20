import { useState } from "react";
import { Lock, Plus, CheckCircle2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  isPremium: boolean;
  count: number;
  freeLimit?: number;
  label?: string;
  className?: string;
  onClick: () => void;
}

export default function FreemiumAddBtn({ isPremium, count, freeLimit = 1, label = "Novo", className = "", onClick }: Props) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const blocked = !isPremium && count >= freeLimit;

  return (
    <>
      <Button
        onClick={blocked ? () => setShowUpgrade(true) : onClick}
        className={`${blocked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-gradient-primary"} ${className}`}
      >
        {blocked ? <Lock className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
        {blocked ? "Premium" : label}
      </Button>

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
            <p className="text-sm text-center text-muted-foreground">
              No plano gratuito você pode cadastrar <strong>1 item</strong> por módulo.
              Assine o Premium para acesso ilimitado.
            </p>

            <div className="bg-gradient-primary text-white rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">R$ 99,00</p>
              <p className="text-sm opacity-80 mt-1">por ano · acesso completo</p>
            </div>

            <div className="space-y-2 text-sm">
              {[
                "Funcionários ilimitados",
                "Moradores/Unidades ilimitados",
                "Despesas e Receitas ilimitadas",
                "Leituras de Gás e Água",
                "Relatórios e exportação CSV",
                "Reservas e Assembleias",
                "Manutenções preventivas",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="bg-muted rounded-xl p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Pague via PIX</p>
              <p className="font-bold text-lg">85998251219</p>
              <p className="text-xs text-muted-foreground">Chave: Celular · Nelson Tomaz</p>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Após o pagamento, envie o comprovante via WhatsApp para{" "}
              <strong>(85) 99825-1219</strong> e seu acesso será liberado em até 24h.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setShowUpgrade(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
