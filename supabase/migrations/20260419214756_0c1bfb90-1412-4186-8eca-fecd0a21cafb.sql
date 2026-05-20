ALTER TABLE public.receitas
  ADD CONSTRAINT receitas_condominio_id_fkey
  FOREIGN KEY (condominio_id) REFERENCES public.condominios(id) ON DELETE CASCADE;

ALTER TABLE public.despesas
  ADD CONSTRAINT despesas_condominio_id_fkey
  FOREIGN KEY (condominio_id) REFERENCES public.condominios(id) ON DELETE SET NULL;