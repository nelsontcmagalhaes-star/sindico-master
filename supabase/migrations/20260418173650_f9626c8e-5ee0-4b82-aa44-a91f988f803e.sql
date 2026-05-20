-- Tabela de condomínios
CREATE TABLE public.condominios (
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
CREATE POLICY "own condominios update" ON public.condominios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own condominios delete" ON public.condominios FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_condominios_updated_at
BEFORE UPDATE ON public.condominios
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Vincular despesas a condomínio (opcional para não quebrar dados existentes)
ALTER TABLE public.despesas ADD COLUMN condominio_id UUID;
CREATE INDEX idx_despesas_condominio ON public.despesas(condominio_id);