-- Enum de categorias
CREATE TYPE public.receita_categoria AS ENUM ('taxa_condominial', 'multa', 'aluguel_area_comum', 'outros');

-- Tabela de receitas
CREATE TABLE public.receitas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  condominio_id UUID NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  data_recebimento DATE NOT NULL,
  data_recebido DATE,
  categoria public.receita_categoria NOT NULL DEFAULT 'outros',
  pagador TEXT,
  recebido BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own receitas select" ON public.receitas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own receitas insert" ON public.receitas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own receitas update" ON public.receitas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own receitas delete" ON public.receitas FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_receitas_updated_at
BEFORE UPDATE ON public.receitas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_receitas_user_id ON public.receitas(user_id);
CREATE INDEX idx_receitas_condominio_id ON public.receitas(condominio_id);
CREATE INDEX idx_receitas_data_recebimento ON public.receitas(data_recebimento);