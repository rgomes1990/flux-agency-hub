
-- Remover todas as políticas existentes das tabelas relacionadas às tarefas
DROP POLICY IF EXISTS "Allow users to manage task columns" ON public.task_columns;
DROP POLICY IF EXISTS "Allow users to manage tasks data" ON public.tasks_data;
DROP POLICY IF EXISTS "Allow authenticated users to manage task columns" ON public.task_columns;
DROP POLICY IF EXISTS "Allow authenticated users to manage tasks data" ON public.tasks_data;

-- Desabilitar RLS temporariamente
ALTER TABLE public.task_columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_data DISABLE ROW LEVEL SECURITY;

-- Reabilitar RLS
ALTER TABLE public.task_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_data ENABLE ROW LEVEL SECURITY;

-- Criar novas políticas que funcionem com autenticação personalizada
CREATE POLICY "Custom auth task columns access" 
  ON public.task_columns 
  FOR ALL 
  USING (user_id IS NOT NULL);

CREATE POLICY "Custom auth tasks data access" 
  ON public.tasks_data 
  FOR ALL 
  USING (user_id IS NOT NULL);
