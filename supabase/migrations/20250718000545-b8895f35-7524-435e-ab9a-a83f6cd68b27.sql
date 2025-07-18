-- Atualizar RLS para tasks_data e task_columns para permitir dados globais
-- Primeiro, remover políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to manage tasks data" ON tasks_data;
DROP POLICY IF EXISTS "Allow authenticated users to manage task columns" ON task_columns;

-- Criar novas políticas para permitir dados globais
CREATE POLICY "Users can manage global tasks data" 
ON tasks_data 
FOR ALL 
USING ((user_id IS NULL) OR (auth.uid()::text = user_id::text));

CREATE POLICY "Users can manage global task columns" 
ON task_columns 
FOR ALL 
USING ((user_id IS NULL) OR (auth.uid()::text = user_id::text));