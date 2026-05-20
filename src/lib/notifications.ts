import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { formatBRL, formatDateBR } from "./format";

interface Despesa {
  id: string;
  descricao: string;
  fornecedor: string | null;
  valor_parcela: number;
  vencimento: string;
  pago: boolean;
}

export async function agendarAlertasVencimento(despesas: Despesa[]) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== "granted") return;
    }

    // Cancela pendentes
    const pend = await LocalNotifications.getPending();
    if (pend.notifications.length) {
      await LocalNotifications.cancel({ notifications: pend.notifications });
    }

    const now = Date.now();
    const notifs = despesas
      .filter((d) => !d.pago)
      .map((d) => {
        const [y, m, day] = d.vencimento.split("-").map(Number);
        // 1 dia antes às 09:00
        const at = new Date(y, m - 1, day - 1, 9, 0, 0);
        return { d, at };
      })
      .filter(({ at }) => at.getTime() > now)
      .slice(0, 60)
      .map(({ d, at }, idx) => ({
        id: idx + 1,
        title: "Vencimento amanhã",
        body: `${d.descricao} - ${formatBRL(d.valor_parcela)} vence em ${formatDateBR(d.vencimento)}`,
        schedule: { at },
        smallIcon: "ic_stat_icon_config_sample",
      }));

    if (notifs.length) {
      await LocalNotifications.schedule({ notifications: notifs });
    }
  } catch (e) {
    console.error("Erro ao agendar notificações:", e);
  }
}
