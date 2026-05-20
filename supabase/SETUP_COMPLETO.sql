-- ============================================================
-- SINDICOMASTER — SQL COMPLETO DE SETUP
-- Execute este arquivo no Supabase SQL Editor de uma só vez
-- Projeto: https://lgmdbucvqhlwptqntpfy.supabase.co
-- ============================================================

-- ─── 1. FUNÇÃO DE TIMESTAMP ───────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ─── 2. PROFILES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-criar perfil ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 3. CONDOMINIOS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.condominios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  cnpj TEXT,
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  sindico TEXT,
  telefone TEXT,
  email TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.condominios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own condominios select" ON public.condominios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own condominios insert" ON public.condominios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own condominios update" ON public.condominios FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own condominios delete" ON public.condominios FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_condominios_updated BEFORE UPDATE ON public.condominios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 4. DESPESAS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.despesas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condominio_id UUID REFERENCES public.condominios(id) ON DELETE SET NULL,
  data_compra DATE,
  descricao TEXT NOT NULL,
  fornecedor TEXT,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  num_parcelas TEXT,
  parcela_atual INT NOT NULL DEFAULT 1,
  valor_parcela NUMERIC(12,2) NOT NULL DEFAULT 0,
  vencimento DATE NOT NULL,
  pago BOOLEAN NOT NULL DEFAULT false,
  data_pagamento DATE,
  forma_pagamento TEXT NOT NULL DEFAULT 'boleto',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_despesas_user ON public.despesas(user_id);
CREATE INDEX IF NOT EXISTS idx_despesas_venc ON public.despesas(vencimento);
CREATE INDEX IF NOT EXISTS idx_despesas_condominio ON public.despesas(condominio_id);
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own despesas select" ON public.despesas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own despesas insert" ON public.despesas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own despesas update" ON public.despesas FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own despesas delete" ON public.despesas FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_despesas_updated BEFORE UPDATE ON public.despesas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 5. RECEITAS ──────────────────────────────────────────
CREATE TYPE IF NOT EXISTS public.receita_categoria AS ENUM (
  'taxa_condominial', 'taxa_extra', 'multa', 'aluguel_area_comum', 'outros'
);
CREATE TABLE IF NOT EXISTS public.receitas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  data_recebimento DATE NOT NULL,
  data_recebido DATE,
  categoria public.receita_categoria NOT NULL DEFAULT 'outros',
  pagador TEXT,
  recebido BOOLEAN NOT NULL DEFAULT false,
  parcela_atual INTEGER,
  num_parcelas INTEGER,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own receitas select" ON public.receitas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own receitas insert" ON public.receitas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own receitas update" ON public.receitas FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own receitas delete" ON public.receitas FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_receitas_updated BEFORE UPDATE ON public.receitas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON public.receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_condominio_id ON public.receitas(condominio_id);

-- ─── 6. MANUTENÇÕES ───────────────────────────────────────
CREATE TYPE IF NOT EXISTS public.manutencao_periodicidade AS ENUM (
  'mensal','bimestral','trimestral','semestral','anual','unica'
);
CREATE TABLE IF NOT EXISTS public.manutencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  condominio_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  periodicidade public.manutencao_periodicidade NOT NULL DEFAULT 'mensal',
  proxima_data DATE NOT NULL,
  ultima_execucao DATE,
  responsavel TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own manutencoes select" ON public.manutencoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own manutencoes insert" ON public.manutencoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own manutencoes update" ON public.manutencoes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own manutencoes delete" ON public.manutencoes FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_manutencoes_updated BEFORE UPDATE ON public.manutencoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 7. ANOTAÇÕES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.anotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  condominio_id UUID NOT NULL,
  mes_referencia DATE NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anotacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own anotacoes select" ON public.anotacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own anotacoes insert" ON public.anotacoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own anotacoes update" ON public.anotacoes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own anotacoes delete" ON public.anotacoes FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_anotacoes_updated BEFORE UPDATE ON public.anotacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 8. ANEXOS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  anotacao_id UUID REFERENCES public.anotacoes(id) ON DELETE CASCADE,
  manutencao_id UUID REFERENCES public.manutencoes(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  mime_type TEXT,
  tamanho INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((anotacao_id IS NOT NULL)::int + (manutencao_id IS NOT NULL)::int = 1)
);
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own anexos select" ON public.anexos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own anexos insert" ON public.anexos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own anexos delete" ON public.anexos FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket para anexos
INSERT INTO storage.buckets (id, name, public) VALUES ('anexos','anexos', false)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "anexos select own" ON storage.objects FOR SELECT
  USING (bucket_id = 'anexos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "anexos insert own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'anexos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "anexos delete own" ON storage.objects FOR DELETE
  USING (bucket_id = 'anexos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─── 9. FUNCIONÁRIOS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cargo TEXT,
  telefone TEXT,
  cpf TEXT,
  data_admissao DATE,
  salario NUMERIC(12,2),
  horas_extras NUMERIC(10,2),
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado VARCHAR(2),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own funcionarios" ON public.funcionarios
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_funcionarios_updated BEFORE UPDATE ON public.funcionarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 10. MORADORES / UNIDADES ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.moradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unidade TEXT NOT NULL,
  responsavel TEXT,
  telefone TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.moradores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own moradores" ON public.moradores
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_moradores_updated BEFORE UPDATE ON public.moradores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 11. RESERVAS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  data DATE NOT NULL,
  morador_id UUID REFERENCES public.moradores(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reservas" ON public.reservas
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_reservas_updated BEFORE UPDATE ON public.reservas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 12. ASSEMBLEIAS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assembleias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  horario TIME,
  local TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.assembleias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assembleias" ON public.assembleias
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_assembleias_updated BEFORE UPDATE ON public.assembleias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- FIM DO SETUP — 12 tabelas criadas com RLS ativado
-- ============================================================
