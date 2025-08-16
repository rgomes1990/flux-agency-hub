-- Criar bucket para arquivos de tarefas
INSERT INTO storage.buckets (id, name, public) VALUES ('task-files', 'task-files', false);

-- Políticas RLS para o bucket task-files
CREATE POLICY "Users can upload task files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'task-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view task files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update task files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'task-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete task files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'task-files' AND auth.uid() IS NOT NULL);