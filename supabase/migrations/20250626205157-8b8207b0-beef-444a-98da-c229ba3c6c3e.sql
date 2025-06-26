
-- Remover todas as constraints existentes primeiro
ALTER TABLE public.content_data DROP CONSTRAINT IF EXISTS content_data_user_id_fkey;
ALTER TABLE public.traffic_data DROP CONSTRAINT IF EXISTS traffic_data_user_id_fkey;
ALTER TABLE public.status_config DROP CONSTRAINT IF EXISTS status_config_user_id_fkey;
ALTER TABLE public.column_config DROP CONSTRAINT IF EXISTS column_config_user_id_fkey;
ALTER TABLE public.client_passwords DROP CONSTRAINT IF EXISTS client_passwords_user_id_fkey;

-- Limpar dados órfãos se existirem
DELETE FROM public.content_data 
WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM public.app_users);

DELETE FROM public.traffic_data 
WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM public.app_users);

DELETE FROM public.status_config 
WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM public.app_users);

DELETE FROM public.column_config 
WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM public.app_users);

DELETE FROM public.client_passwords 
WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM public.app_users);

-- Adicionar constraints corretas que referenciam app_users
ALTER TABLE public.content_data 
ADD CONSTRAINT content_data_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

ALTER TABLE public.traffic_data 
ADD CONSTRAINT traffic_data_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

ALTER TABLE public.status_config 
ADD CONSTRAINT status_config_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

ALTER TABLE public.column_config 
ADD CONSTRAINT column_config_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

ALTER TABLE public.client_passwords 
ADD CONSTRAINT client_passwords_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

-- Remover todas as políticas RLS existentes explicitamente
DROP POLICY IF EXISTS "Users can manage their own content data" ON public.content_data;
DROP POLICY IF EXISTS "Allow authenticated users to manage content data" ON public.content_data;
DROP POLICY IF EXISTS "Users can manage their own traffic data" ON public.traffic_data;
DROP POLICY IF EXISTS "Allow authenticated users to manage traffic data" ON public.traffic_data;
DROP POLICY IF EXISTS "Users can manage their own status config" ON public.status_config;
DROP POLICY IF EXISTS "Allow authenticated users to manage status config" ON public.status_config;
DROP POLICY IF EXISTS "Users can manage their own column config" ON public.column_config;
DROP POLICY IF EXISTS "Allow authenticated users to manage column config" ON public.column_config;
DROP POLICY IF EXISTS "Users can manage their own client passwords" ON public.client_passwords;
DROP POLICY IF EXISTS "Allow authenticated users to manage client passwords" ON public.client_passwords;

-- Criar novas políticas RLS
CREATE POLICY "Content data access for authenticated users" 
  ON public.content_data 
  FOR ALL 
  USING (user_id IS NOT NULL);

CREATE POLICY "Traffic data access for authenticated users" 
  ON public.traffic_data 
  FOR ALL 
  USING (user_id IS NOT NULL);

CREATE POLICY "Status config access for authenticated users" 
  ON public.status_config 
  FOR ALL 
  USING (user_id IS NOT NULL);

CREATE POLICY "Column config access for authenticated users" 
  ON public.column_config 
  FOR ALL 
  USING (user_id IS NOT NULL);

CREATE POLICY "Client passwords access for authenticated users" 
  ON public.client_passwords 
  FOR ALL 
  USING (user_id IS NOT NULL);
