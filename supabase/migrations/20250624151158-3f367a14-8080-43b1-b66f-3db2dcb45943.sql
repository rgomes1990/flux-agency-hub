
-- Criar tabela para configurações de colunas das tarefas
CREATE TABLE IF NOT EXISTS public.task_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL,
  column_title TEXT NOT NULL,
  column_color TEXT NOT NULL DEFAULT 'bg-gray-100',
  column_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.task_columns ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para task_columns
CREATE POLICY "Users can view their own task columns" 
  ON public.task_columns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task columns" 
  ON public.task_columns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task columns" 
  ON public.task_columns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task columns" 
  ON public.task_columns 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Garantir que as tabelas existentes tenham RLS habilitado
ALTER TABLE public.content_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.column_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para content_data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'content_data' AND policyname = 'Users can view their own content data'
  ) THEN
    CREATE POLICY "Users can view their own content data" 
      ON public.content_data 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'content_data' AND policyname = 'Users can create their own content data'
  ) THEN
    CREATE POLICY "Users can create their own content data" 
      ON public.content_data 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'content_data' AND policyname = 'Users can update their own content data'
  ) THEN
    CREATE POLICY "Users can update their own content data" 
      ON public.content_data 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'content_data' AND policyname = 'Users can delete their own content data'
  ) THEN
    CREATE POLICY "Users can delete their own content data" 
      ON public.content_data 
      FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas RLS para traffic_data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'traffic_data' AND policyname = 'Users can view their own traffic data'
  ) THEN
    CREATE POLICY "Users can view their own traffic data" 
      ON public.traffic_data 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'traffic_data' AND policyname = 'Users can create their own traffic data'
  ) THEN
    CREATE POLICY "Users can create their own traffic data" 
      ON public.traffic_data 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'traffic_data' AND policyname = 'Users can update their own traffic data'
  ) THEN
    CREATE POLICY "Users can update their own traffic data" 
      ON public.traffic_data 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'traffic_data' AND policyname = 'Users can delete their own traffic data'
  ) THEN
    CREATE POLICY "Users can delete their own traffic data" 
      ON public.traffic_data 
      FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas RLS para tasks_data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks_data' AND policyname = 'Users can view their own tasks data'
  ) THEN
    CREATE POLICY "Users can view their own tasks data" 
      ON public.tasks_data 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks_data' AND policyname = 'Users can create their own tasks data'
  ) THEN
    CREATE POLICY "Users can create their own tasks data" 
      ON public.tasks_data 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks_data' AND policyname = 'Users can update their own tasks data'
  ) THEN
    CREATE POLICY "Users can update their own tasks data" 
      ON public.tasks_data 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks_data' AND policyname = 'Users can delete their own tasks data'
  ) THEN
    CREATE POLICY "Users can delete their own tasks data" 
      ON public.tasks_data 
      FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas RLS para column_config
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'column_config' AND policyname = 'Users can view their own column config'
  ) THEN
    CREATE POLICY "Users can view their own column config" 
      ON public.column_config 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'column_config' AND policyname = 'Users can create their own column config'
  ) THEN
    CREATE POLICY "Users can create their own column config" 
      ON public.column_config 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'column_config' AND policyname = 'Users can update their own column config'
  ) THEN
    CREATE POLICY "Users can update their own column config" 
      ON public.column_config 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'column_config' AND policyname = 'Users can delete their own column config'
  ) THEN
    CREATE POLICY "Users can delete their own column config" 
      ON public.column_config 
      FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas RLS para status_config
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'status_config' AND policyname = 'Users can view their own status config'
  ) THEN
    CREATE POLICY "Users can view their own status config" 
      ON public.status_config 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'status_config' AND policyname = 'Users can create their own status config'
  ) THEN
    CREATE POLICY "Users can create their own status config" 
      ON public.status_config 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'status_config' AND policyname = 'Users can update their own status config'
  ) THEN
    CREATE POLICY "Users can update their own status config" 
      ON public.status_config 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'status_config' AND policyname = 'Users can delete their own status config'
  ) THEN
    CREATE POLICY "Users can delete their own status config" 
      ON public.status_config 
      FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;
