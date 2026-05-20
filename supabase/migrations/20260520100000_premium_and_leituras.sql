-- Adiciona premium ao perfil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lgpd_accepted_at TIMESTAMPTZ;

-- Tabela de leituras mensais (gás ou água)
CREATE TABLE IF NOT EXISTS public.leituras_mes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condominio_id UUID REFERENCES public.condominios(id) ON DELETE SET NULL,
  mes_referencia DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('gas', 'agua')),
  valor_fatura NUMERIC(12,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.leituras_mes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own leituras_mes" ON public.leituras_mes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_leituras_mes_updated BEFORE UPDATE ON public.leituras_mes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Detalhes por unidade/apartamento
CREATE TABLE IF NOT EXISTS public.leituras_detalhes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leitura_mes_id UUID NOT NULL REFERENCES public.leituras_mes(id) ON DELETE CASCADE,
  unidade TEXT NOT NULL,
  leitura_anterior NUMERIC(10,3) NOT NULL DEFAULT 0,
  leitura_atual NUMERIC(10,3) NOT NULL DEFAULT 0,
  consumo NUMERIC(10,3) GENERATED ALWAYS AS (leitura_atual - leitura_anterior) STORED,
  valor_calculado NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.leituras_detalhes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own leituras_detalhes" ON public.leituras_detalhes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.leituras_mes lm WHERE lm.id = leitura_mes_id AND lm.user_id = auth.uid())
  );
