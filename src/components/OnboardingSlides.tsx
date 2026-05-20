import { useState } from "react";
import { Building2, DollarSign, Users, Wrench, BarChart3, Droplets, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const slides = [
  {
    icon: Building2,
    title: "SíndicoMaster",
    subtitle: "Gestão condominial completa",
    text: "Tudo que um síndico precisa em um único aplicativo. Simples, rápido e sempre disponível no celular.",
    color: "bg-gradient-primary",
  },
  {
    icon: DollarSign,
    title: "Finanças",
    subtitle: "Despesas e Receitas",
    text: "Controle total das entradas e saídas do condomínio. Acompanhe o saldo em tempo real e exporte relatórios em CSV.",
    color: "bg-gradient-primary",
  },
  {
    icon: Droplets,
    title: "Gás & Água",
    subtitle: "Rateio automático",
    text: "Lance as leituras de cada apartamento e o sistema calcula automaticamente o valor proporcional de cada unidade com base na fatura total.",
    color: "bg-gradient-primary",
  },
  {
    icon: Users,
    title: "Equipe & Moradores",
    subtitle: "Cadastros completos",
    text: "Gerencie funcionários (com salário, CPF, admissão) e moradores (por unidade). Controle reservas de áreas comuns e assembleias.",
    color: "bg-gradient-primary",
  },
  {
    icon: Wrench,
    title: "Manutenções",
    subtitle: "Controle preventivo",
    text: "Cadastre manutenções com periodicidade (mensal, trimestral, anual…) e receba alertas automáticos de vencimento.",
    color: "bg-gradient-primary",
  },
  {
    icon: BarChart3,
    title: "Plano Gratuito",
    subtitle: "Comece sem pagar nada",
    text: "No plano grátis você cadastra 1 item em cada módulo para conhecer o sistema. Para uso completo, assine por apenas R$ 99/ano.",
    color: "bg-gradient-primary",
  },
];

interface Props {
  onFinish: () => void;
}

export default function OnboardingSlides({ onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const slide = slides[idx];
  const Icon = slide.icon;
  const isLast = idx === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
      <button onClick={onFinish} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
        <X className="h-5 w-5" />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className={`${slide.color} p-6 rounded-3xl shadow-elev`}>
          <Icon className="h-16 w-16 text-white" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{slide.title}</h2>
          <p className="text-sm font-semibold text-primary">{slide.subtitle}</p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{slide.text}</p>
        </div>

        <div className="flex gap-1.5 mt-2">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted"}`} />
          ))}
        </div>

        <div className="flex gap-3 w-full">
          {idx > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setIdx(i => i - 1)}>Anterior</Button>
          )}
          <Button
            className={`${idx === 0 ? "w-full" : "flex-1"} bg-gradient-primary`}
            onClick={() => isLast ? onFinish() : setIdx(i => i + 1)}
          >
            {isLast ? "Começar" : "Próximo"} <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
