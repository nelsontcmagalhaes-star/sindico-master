ALTER TYPE public.receita_categoria ADD VALUE IF NOT EXISTS 'taxa_extra';

ALTER TABLE public.receitas
  ADD COLUMN IF NOT EXISTS parcela_atual integer,
  ADD COLUMN IF NOT EXISTS num_parcelas integer;