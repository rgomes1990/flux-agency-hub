
-- Remover todas as políticas RLS existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Users can view their own task columns" ON public.task_columns;
DROP POLICY IF EXISTS "Users can create their own task columns" ON public.task_columns;
DROP POLICY IF EXISTS "Users can update their own task columns" ON public.task_columns;
DROP POLICY IF EXISTS "Users can delete their own task columns" ON public.task_columns;

DROP POLICY IF EXISTS "Users can view their own tasks data" ON public.tasks_data;
DROP POLICY IF EXISTS "Users can create their own tasks data" ON public.tasks_data;
DROP POLICY IF EXISTS "Users can update their own tasks data" ON public.tasks_data;
DROP POLICY IF EXISTS "Users can delete their own tasks data" ON public.tasks_data;

DROP POLICY IF EXISTS "Users can view their own content data" ON public.content_data;
DROP POLICY IF EXISTS "Users can create their own content data" ON public.content_data;
DROP POLICY IF EXISTS "Users can update their own content data" ON public.content_data;
DROP POLICY IF EXISTS "Users can delete their own content data" ON public.content_data;

DROP POLICY IF EXISTS "Users can view their own traffic data" ON public.traffic_data;
DROP POLICY IF EXISTS "Users can create their own traffic data" ON public.traffic_data;
DROP POLICY IF EXISTS "Users can update their own traffic data" ON public.traffic_data;
DROP POLICY IF EXISTS "Users can delete their own traffic data" ON public.traffic_data;

DROP POLICY IF EXISTS "Users can view their own client passwords" ON public.client_passwords;
DROP POLICY IF EXISTS "Users can create their own client passwords" ON public.client_passwords;
DROP POLICY IF EXISTS "Users can update their own client passwords" ON public.client_passwords;
DROP POLICY IF EXISTS "Users can delete their own client passwords" ON public.client_passwords;

DROP POLICY IF EXISTS "Users can view their own column config" ON public.column_config;
DROP POLICY IF EXISTS "Users can create their own column config" ON public.column_config;
DROP POLICY IF EXISTS "Users can update their own column config" ON public.column_config;
DROP POLICY IF EXISTS "Users can delete their own column config" ON public.column_config;

DROP POLICY IF EXISTS "Users can view their own status config" ON public.status_config;
DROP POLICY IF EXISTS "Users can create their own status config" ON public.status_config;
DROP POLICY IF EXISTS "Users can update their own status config" ON public.status_config;
DROP POLICY IF EXISTS "Users can delete their own status config" ON public.status_config;

-- Recriar políticas RLS simples e funcionais para task_columns
CREATE POLICY "Allow users to manage task columns" 
  ON public.task_columns 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Recriar políticas RLS simples e funcionais para tasks_data
CREATE POLICY "Allow users to manage tasks data" 
  ON public.tasks_data 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Recriar políticas RLS simples e funcionais para content_data
CREATE POLICY "Allow users to manage content data" 
  ON public.content_data 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Recriar políticas RLS simples e funcionais para traffic_data
CREATE POLICY "Allow users to manage traffic data" 
  ON public.traffic_data 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Recriar políticas RLS simples e funcionais para client_passwords
CREATE POLICY "Allow users to manage client passwords" 
  ON public.client_passwords 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Recriar políticas RLS simples e funcionais para column_config
CREATE POLICY "Allow users to manage column config" 
  ON public.column_config 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Recriar políticas RLS simples e funcionais para status_config
CREATE POLICY "Allow users to manage status config" 
  ON public.status_config 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Garantir que RLS está habilitado em todas as tabelas
ALTER TABLE public.task_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.column_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_config ENABLE ROW LEVEL SECURITY;
