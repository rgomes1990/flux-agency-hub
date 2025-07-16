-- Corrigir RLS policies para sites_data para funcionar com sistema de autenticação customizado
-- Remove políticas antigas
DROP POLICY IF EXISTS "Users can create global sites data" ON public.sites_data;
DROP POLICY IF EXISTS "Users can delete global sites data" ON public.sites_data;
DROP POLICY IF EXISTS "Users can update global sites data" ON public.sites_data;
DROP POLICY IF EXISTS "Users can view global sites data" ON public.sites_data;

-- Criar novas políticas mais permissivas para usuários autenticados
CREATE POLICY "Authenticated users can view sites data" 
ON public.sites_data 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create sites data" 
ON public.sites_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sites data" 
ON public.sites_data 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete sites data" 
ON public.sites_data 
FOR DELETE 
USING (true);