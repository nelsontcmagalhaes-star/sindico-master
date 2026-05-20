-- Enum periodicidade
CREATE TYPE public.manutencao_periodicidade AS ENUM ('mensal','bimestral','trimestral','semestral','anual','unica');

-- Anotações gerais
CREATE TABLE public.anotacoes (
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
CREATE TRIGGER trg_anotacoes_updated BEFORE UPDATE ON public.anotacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Manutenções preventivas
CREATE TABLE public.manutencoes (
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
CREATE TRIGGER trg_manutencoes_updated BEFORE UPDATE ON public.manutencoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Anexos (PDF/imagens) ligados a anotacao OU manutencao
CREATE TABLE public.anexos (
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

-- Storage bucket privado
INSERT INTO storage.buckets (id, name, public) VALUES ('anexos','anexos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anexos select own" ON storage.objects FOR SELECT
  USING (bucket_id = 'anexos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "anexos insert own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'anexos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "anexos delete own" ON storage.objects FOR DELETE
  USING (bucket_id = 'anexos' AND auth.uid()::text = (storage.foldername(name))[1]);