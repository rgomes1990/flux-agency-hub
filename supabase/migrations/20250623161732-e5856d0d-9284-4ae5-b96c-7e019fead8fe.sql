
-- Criar tabelas para salvar dados de conteúdo, tarefas e tráfego no Supabase
-- Tabela para dados de conteúdo
CREATE TABLE IF NOT EXISTS public.content_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_color TEXT DEFAULT 'bg-blue-500',
  is_expanded BOOLEAN DEFAULT true,
  item_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para dados de tráfego
CREATE TABLE IF NOT EXISTS public.traffic_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_color TEXT DEFAULT 'bg-red-500',
  is_expanded BOOLEAN DEFAULT true,
  item_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para dados de tarefas
CREATE TABLE IF NOT EXISTS public.tasks_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL,
  column_title TEXT NOT NULL,
  column_color TEXT DEFAULT 'bg-gray-100',
  task_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para senhas de clientes
CREATE TABLE IF NOT EXISTS public.client_passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
  cliente TEXT NOT NULL,
  plataforma TEXT NOT NULL,
  observacoes TEXT,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações de status
CREATE TABLE IF NOT EXISTS public.status_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
  module TEXT NOT NULL, -- 'content', 'traffic', 'tasks'
  status_id TEXT NOT NULL,
  status_name TEXT NOT NULL,
  status_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações de colunas
CREATE TABLE IF NOT EXISTS public.column_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
  module TEXT NOT NULL, -- 'content', 'traffic', 'tasks'
  column_id TEXT NOT NULL,
  column_name TEXT NOT NULL,
  column_type TEXT NOT NULL, -- 'status', 'text'
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.content_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.column_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para content_data
CREATE POLICY "Users can manage their own content data" ON public.content_data
  FOR ALL USING (user_id IN (SELECT id FROM public.app_users WHERE username = current_user));

-- Políticas RLS para traffic_data  
CREATE POLICY "Users can manage their own traffic data" ON public.traffic_data
  FOR ALL USING (user_id IN (SELECT id FROM public.app_users WHERE username = current_user));

-- Políticas RLS para tasks_data
CREATE POLICY "Users can manage their own tasks data" ON public.tasks_data
  FOR ALL USING (user_id IN (SELECT id FROM public.app_users WHERE username = current_user));

-- Políticas RLS para client_passwords
CREATE POLICY "Users can manage their own client passwords" ON public.client_passwords
  FOR ALL USING (user_id IN (SELECT id FROM public.app_users WHERE username = current_user));

-- Políticas RLS para status_config
CREATE POLICY "Users can manage their own status config" ON public.status_config
  FOR ALL USING (user_id IN (SELECT id FROM public.app_users WHERE username = current_user));

-- Políticas RLS para column_config
CREATE POLICY "Users can manage their own column config" ON public.column_config
  FOR ALL USING (user_id IN (SELECT id FROM public.app_users WHERE username = current_user));
