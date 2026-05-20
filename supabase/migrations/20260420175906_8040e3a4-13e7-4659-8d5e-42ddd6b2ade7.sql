ALTER POLICY "own despesas update" ON public.despesas USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
ALTER POLICY "own receitas update" ON public.receitas USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
ALTER POLICY "own condominios update" ON public.condominios USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
ALTER POLICY "own profile update" ON public.profiles USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);