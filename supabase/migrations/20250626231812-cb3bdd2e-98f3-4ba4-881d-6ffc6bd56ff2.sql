
-- Primeiro, vamos verificar e corrigir a estrutura da tabela sites_data
-- Tornar user_id obrigatório (NOT NULL) para RLS funcionar corretamente
ALTER TABLE public.sites_data 
ALTER COLUMN user_id SET NOT NULL;

-- Adicionar um valor padrão caso haja registros existentes sem user_id
UPDATE public.sites_data 
SET user_id = 'cf6a9cf0-7098-4ac2-829f-559902931363' 
WHERE user_id IS NULL;
