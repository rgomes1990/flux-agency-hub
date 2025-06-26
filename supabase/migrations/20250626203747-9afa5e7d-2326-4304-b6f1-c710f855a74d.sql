
-- Remover todas as constraints existentes primeiro
ALTER TABLE public.task_columns DROP CONSTRAINT IF EXISTS task_columns_user_id_fkey;
ALTER TABLE public.tasks_data DROP CONSTRAINT IF EXISTS tasks_data_user_id_fkey;

-- Limpar dados órfãos se existirem
DELETE FROM public.task_columns 
WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM public.app_users);

DELETE FROM public.tasks_data 
WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM public.app_users);

-- Adicionar novas constraints que referenciam app_users
ALTER TABLE public.task_columns 
ADD CONSTRAINT task_columns_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

ALTER TABLE public.tasks_data 
ADD CONSTRAINT tasks_data_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

-- Atualizar políticas RLS
DROP POLICY IF EXISTS "Custom auth task columns access" ON public.task_columns;
DROP POLICY IF EXISTS "Custom auth tasks data access" ON public.tasks_data;
DROP POLICY IF EXISTS "Allow authenticated users to manage task columns" ON public.task_columns;
DROP POLICY IF EXISTS "Allow authenticated users to manage tasks data" ON public.tasks_data;

CREATE POLICY "Allow authenticated users to manage task columns" 
  ON public.task_columns 
  FOR ALL 
  USING (user_id IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage tasks data" 
  ON public.tasks_data 
  FOR ALL 
  USING (user_id IS NOT NULL);
