import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDateBR, diffDays, todayISO } from "@/lib/format";
import { agendarAlertasVencimento } from "@/lib/notifications";
import { AlertTriangle, Calendar, CheckCircle2, TrendingUp, Bell, Users, UserCircle, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { toast } from "sonner";
import SaldoMes from "@/components/SaldoMes";
import { Link } from "react-router-dom";

interface Despesa {
  id: string;
  descricao: string;
  fornecedor: string | null;
  valor_parcela: number;
  vencimento: string;
  pago: boolean;
}

export default function Index() {
  useEffect(() => { document.title = "Início - SíndicoMaster"; }, []);

  const { data: despesas = [] } = useQuery<Despesa[]>({
    queryKey: ["despesas-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("despesas")
        .select("id, descricao, fornecedor, valor_parcela, vencimento, pago")
        .order("vencimento", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Despesa[];
    },
  });

  const { data: funcionarios = [] } = useQuery({
    queryKey: ["funcionarios-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("funcionarios").select("id");
      if (error) return [];
      return data ?? [];
    },
  });

  const { data: moradores = [] } = useQuery({
    queryKey: ["moradores-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("moradores").select("id");
      if (error) return [];
      return data ?? [];
    },
  });

  const { data: reservas = [] } = useQuery({
    queryKey: ["reservas-count"],
    queryFn: async () => {
      const hoje = todayISO();
      const { data, error } = await supabase.from("reservas").select("id").gte("data", hoje);
      if (error) return [];
      return data ?? [];
    },
  });

  useEffect(() => {
    if (despesas.length) agendarAlertasVencimento(despesas);
  }, [despesas]);

  const hoje = todayISO();
  const aVencer = despesas.filter((d) => !d.pago);
  const totalAVencer = aVencer.reduce((s, d) => s + Number(d.valor_parcela), 0);

  const mesAtual = hoje.slice(0, 7);
  const aVencerMes = aVencer.filter((d) => d.vencimento.slice(0, 7) === mesAtual);
  const totalMes = aVencerMes.reduce((s, d) => s + Number(d.valor_parcela), 0);

  const vencidas = aVencer.filter((d) => d.vencimento < hoje);
  const totalVencido = vencidas.reduce((s, d) => s + Number(d.valor_parcela), 0);

  const pagas = despesas.filter((d) => d.pago);
  const totalPago = pagas.reduce((s, d) => s + Number(d.valor_parcela), 0);

  const proximas = aVencer.filter((d) => d.vencimento >= hoje);

  const MESES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const proximasPorMes = useMemo(() => {
    const map = new Map<string, Despesa[]>();
    for (const d of proximas) {
      const k = d.vencimento.slice(0, 7);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(d);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [proximas]);

  const [mesAtivo, setMesAtivo] = useState<string | null>(null);
  useEffect(() => {
    if (!mesAtivo && proximasPorMes.length) {
      const found = proximasPorMes.find(([k]) => k === mesAtual) ?? proximasPorMes[0];
      setMesAtivo(found[0]);
    }
  }, [proximasPorMes, mesAtivo, mesAtual]);

  const listaMesAtivo = proximasPorMes.find(([k]) => k === mesAtivo)?.[1] ?? [];
  const totalMesAtivo = listaMesAtivo.reduce((s, d) => s + Number(d.valor_parcela), 0);

  const pedirNotif = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.info("Disponível no app instalado (iOS/Android)");
      return;
    }
    const r = await LocalNotifications.requestPermissions();
    if (r.display === "granted") {
      await agendarAlertasVencimento(despesas);
      toast.success("Alertas de vencimento ativados");
    }
  };

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3">
        <Card className="p-4 shadow-card bg-gradient-primary text-primary-foreground">
          <div className="flex items-center gap-2 text-xs opacity-90"><TrendingUp className="h-4 w-4" />Total a vencer</div>
          <p className="text-2xl font-bold mt-2">{formatBRL(totalAVencer)}</p>
          <p className="text-xs opacity-80 mt-1">{aVencer.length} parcelas</p>
        </Card>
        <Card className="p-4 shadow-card bg-gradient-warn text-warning-foreground">
          <div className="flex items-center gap-2 text-xs opacity-90"><Calendar className="h-4 w-4" />Vence este mês</div>
          <p className="text-2xl font-bold mt-2">{formatBRL(totalMes)}</p>
          <p className="text-xs opacity-80 mt-1">{aVencerMes.length} parcelas</p>
        </Card>
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs text-destructive"><AlertTriangle className="h-4 w-4" />Vencidas</div>
          <p className="text-2xl font-bold mt-2 text-destructive">{formatBRL(totalVencido)}</p>
          <p className="text-xs text-muted-foreground mt-1">{vencidas.length} parcelas</p>
        </Card>
        <Card className="p-4 shadow-card bg-gradient-success text-success-foreground">
          <div className="flex items-center gap-2 text-xs opacity-90"><CheckCircle2 className="h-4 w-4" />Pago</div>
          <p className="text-2xl font-bold mt-2">{formatBRL(totalPago)}</p>
          <p className="text-xs opacity-80 mt-1">{pagas.length} parcelas</p>
        </Card>
      </section>

      {/* Quick stats: Funcionarios, Moradores, Reservas */}
      <section>
        <h2 className="font-semibold text-foreground mb-3">Visão geral</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link to="/funcionarios">
            <Card className="p-3 shadow-card hover:shadow-elev transition-shadow cursor-pointer">
              <div className="flex flex-col items-center gap-1">
                <Users className="h-6 w-6 text-primary" />
                <p className="text-2xl font-bold">{funcionarios.length}</p>
                <p className="text-xs text-muted-foreground text-center">Funcionários</p>
              </div>
            </Card>
          </Link>
          <Link to="/moradores">
            <Card className="p-3 shadow-card hover:shadow-elev transition-shadow cursor-pointer">
              <div className="flex flex-col items-center gap-1">
                <UserCircle className="h-6 w-6 text-primary" />
                <p className="text-2xl font-bold">{moradores.length}</p>
                <p className="text-xs text-muted-foreground text-center">Unidades</p>
              </div>
            </Card>
          </Link>
          <Link to="/reservas">
            <Card className="p-3 shadow-card hover:shadow-elev transition-shadow cursor-pointer">
              <div className="flex flex-col items-center gap-1">
                <CalendarDays className="h-6 w-6 text-primary" />
                <p className="text-2xl font-bold">{reservas.length}</p>
                <p className="text-xs text-muted-foreground text-center">Reservas</p>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <SaldoMes />

      <Button onClick={pedirNotif} variant="outline" className="w-full">
        <Bell className="h-4 w-4 mr-2" />Ativar alerta 1 dia antes do vencimento
      </Button>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Próximos vencimentos</h2>
          {mesAtivo && (
            <span className="text-xs text-muted-foreground">
              Total: <span className="font-bold text-foreground">{formatBRL(totalMesAtivo)}</span>
            </span>
          )}
        </div>

        {proximasPorMes.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">Nenhuma despesa a vencer</Card>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 scrollbar-thin">
              {proximasPorMes.map(([k, lista]) => {
                const [y, m] = k.split("-");
                const label = `${MESES_PT[Number(m) - 1]}/${y.slice(2)}`;
                const ativo = k === mesAtivo;
                const total = lista.reduce((s, d) => s + Number(d.valor_parcela), 0);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setMesAtivo(k)}
                    className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                      ativo
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-accent/10"
                    }`}
                  >
                    <div>{label}</div>
                    <div className={`text-[10px] mt-0.5 ${ativo ? "opacity-90" : "text-muted-foreground"}`}>
                      {formatBRL(total)} • {lista.length}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              {listaMesAtivo.map((d) => {
                const dias = diffDays(d.vencimento);
                const urgente = dias <= 1;
                return (
                  <Card key={d.id} className="p-3 shadow-card">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{d.descricao}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{d.fornecedor}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatBRL(d.valor_parcela)}</p>
                        <Badge
                          variant={urgente ? "destructive" : "secondary"}
                          className="text-[10px] mt-1"
                        >
                          {formatDateBR(d.vencimento)}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
