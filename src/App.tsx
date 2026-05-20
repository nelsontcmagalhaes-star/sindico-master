import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Despesas from "./pages/Despesas";
import Condominios from "./pages/Condominios";
import Relatorios from "./pages/Relatorios";
import Receitas from "./pages/Receitas";
import Notas from "./pages/Notas";
import Funcionarios from "./pages/Funcionarios";
import Moradores from "./pages/Moradores";
import Reservas from "./pages/Reservas";
import Assembleias from "./pages/Assembleias";
import Consumo from "./pages/Consumo";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<Protected><AppLayout /></Protected>}>
              <Route path="/" element={<Index />} />
              <Route path="/despesas" element={<Despesas />} />
              <Route path="/condominios" element={<Condominios />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/receitas" element={<Receitas />} />
              <Route path="/notas" element={<Notas />} />
              <Route path="/funcionarios" element={<Funcionarios />} />
              <Route path="/moradores" element={<Moradores />} />
              <Route path="/reservas" element={<Reservas />} />
              <Route path="/assembleias" element={<Assembleias />} />
              <Route path="/consumo" element={<Consumo />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
