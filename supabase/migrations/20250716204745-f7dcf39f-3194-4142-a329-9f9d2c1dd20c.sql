-- Atualizar políticas RLS para content_data para permitir acesso global
DROP POLICY IF EXISTS "Allow users to manage content data" ON content_data;
DROP POLICY IF EXISTS "Content data access for authenticated users" ON content_data;

-- Criar novas políticas globais para content_data (igual ao traffic_data)
CREATE POLICY "All users can view all content data" 
ON content_data 
FOR SELECT 
USING (true);

CREATE POLICY "All users can create content data" 
ON content_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "All users can update all content data" 
ON content_data 
FOR UPDATE 
USING (true);

CREATE POLICY "All users can delete all content data" 
ON content_data 
FOR DELETE 
USING (true);