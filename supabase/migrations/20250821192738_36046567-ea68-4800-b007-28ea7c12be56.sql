
-- Criar bucket para arquivos de clientes (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-files', 'client-files', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para permitir que todos os usuários autenticados possam fazer upload
CREATE POLICY "Allow authenticated users to upload client files" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'client-files');

-- Políticas para permitir que todos os usuários autenticados possam visualizar arquivos
CREATE POLICY "Allow authenticated users to view client files" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'client-files');

-- Políticas para permitir que todos os usuários autenticados possam deletar arquivos
CREATE POLICY "Allow authenticated users to delete client files" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'client-files');

-- Políticas para permitir que todos os usuários autenticados possam atualizar arquivos
CREATE POLICY "Allow authenticated users to update client files" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'client-files');
