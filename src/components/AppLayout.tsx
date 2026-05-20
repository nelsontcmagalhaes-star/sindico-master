import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Building2, Home, Receipt, FileBarChart, LogOut, Building, TrendingUp, NotebookPen, Users, UserCircle, CalendarDays, ClipboardList, Droplets } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const tabs = [
  { to: "/", label: "Início", icon: Home },
  { to: "/despesas", label: "Despesas", icon: Receipt },
  { to: "/receitas", label: "Receitas", icon: TrendingUp },
  { to: "/notas", label: "Notas", icon: NotebookPen },
  { to: "/condominios", label: "Condomínios", icon: Building },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/funcionarios", label: "Equipe", icon: Users },
  { to: "/moradores", label: "Unidades", icon: UserCircle },
  { to: "/reservas", label: "Reservas", icon: CalendarDays },
  { to: "/assembleias", label: "Assembleias", icon: ClipboardList },
  { to: "/consumo", label: "Consumo", icon: Droplets },
];

export default function AppLayout() {
  const { signOut } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4 shadow-elev sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <div>
              <h1 className="font-bold text-lg leading-tight">SíndicoMaster</h1>
              <p className="text-xs opacity-80 leading-tight">Gestão condominial completa</p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={async () => { await signOut(); nav("/auth"); }}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border shadow-elev z-30 overflow-x-auto">
        <div className="max-w-3xl mx-auto flex min-w-max px-1">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 px-3 min-w-[64px] transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <t.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight text-center whitespace-nowrap">{t.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
