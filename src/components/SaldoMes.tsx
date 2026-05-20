import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatBRL, todayISO } from "@/lib/format";
import { Scale } from "lucide-react";

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export default function SaldoMes() {
  const hoje = todayISO();
  const mes = hoje.slice(0, 7); // YYYY-MM
  const inicio = `${mes}-01`;
  // primeiro dia do mês seguinte
  const [y, m] = mes.split("-").map(Number);
  const proxDate = new Date(y, m, 1);
  const fim = `${proxDate.getFullYear()}-${String(proxDate.getMonth() + 1).padStart(2, "0")}-01`;

  const { data: despesas = [] } = useQuery({
    queryKey: ["saldo-despesas", mes],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("despesas")
        .select("valor_parcela, vencimento, pago")
        .gte("vencimento", inicio)
        .lt("vencimento", fim);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: receitas = [] } = useQuery({
    queryKey: ["saldo-receitas", mes],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receitas")
        .select("valor, data_recebimento, recebido")
        .gte("data_recebimento", inicio)
        .lt("data_recebimento", fim);
      if (error) throw error;
      return data ?? [];
    },
  });

  const sum = (arr: any[], k: string) => arr.reduce((s, r) => s + Number(r[k] || 0), 0);

  const despPrev = sum(despesas, "valor_parcela");
  const despReal = sum(despesas.filter((d: any) => d.pago), "valor_parcela");
  const recPrev = sum(receitas, "valor");
  const recReal = sum(receitas.filter((r: any) => r.recebido), "valor");

  const saldoPrev = recPrev - despPrev;
  const saldoReal = recReal - despReal;

  const SaldoCard = ({
    titulo,
    receitas,
    despesas,
    saldo,
  }: {
    titulo: string;
    receitas: number;
    despesas: number;
    saldo: number;
  }) => {
    const positivo = saldo >= 0;
    return (
      <Card
        className={cn(
          "p-4 shadow-card",
          positivo ? "bg-gradient-success text-success-foreground" : "bg-destructive text-destructive-foreground"
        )}
      >
        <div className="flex items-center gap-2 text-xs opacity-90">
          <Scale className="h-4 w-4" />
          {titulo}
        </div>
        <p className="text-2xl font-bold mt-2">{formatBRL(saldo)}</p>
        <div className="flex justify-between text-[11px] opacity-90 mt-2">
          <span>Receitas: {formatBRL(receitas)}</span>
          <span>Despesas: {formatBRL(despesas)}</span>
        </div>
      </Card>
    );
  };

  return (
    <section>
      <h2 className="font-semibold text-foreground mb-3">Saldo do mês</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SaldoCard titulo="Realizado (pago/recebido)" receitas={recReal} despesas={despReal} saldo={saldoReal} />
        <SaldoCard titulo="Previsto (todos os lançamentos)" receitas={recPrev} despesas={despPrev} saldo={saldoPrev} />
      </div>
    </section>
  );
}
