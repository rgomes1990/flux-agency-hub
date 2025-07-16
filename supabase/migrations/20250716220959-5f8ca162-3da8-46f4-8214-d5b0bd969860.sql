-- Atualizar políticas RLS para permitir acesso a dados globais (user_id IS NULL)

-- Políticas para content_data
DROP POLICY IF EXISTS "All users can view all content data" ON content_data;
DROP POLICY IF EXISTS "All users can create content data" ON content_data;
DROP POLICY IF EXISTS "All users can update all content data" ON content_data;
DROP POLICY IF EXISTS "All users can delete all content data" ON content_data;

CREATE POLICY "Users can view global content data" 
ON content_data 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create global content data" 
ON content_data 
FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update global content data" 
ON content_data 
FOR UPDATE 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can delete global content data" 
ON content_data 
FOR DELETE 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Políticas para traffic_data
DROP POLICY IF EXISTS "All users can view all traffic data" ON traffic_data;
DROP POLICY IF EXISTS "All users can create traffic data" ON traffic_data;
DROP POLICY IF EXISTS "All users can update all traffic data" ON traffic_data;
DROP POLICY IF EXISTS "All users can delete all traffic data" ON traffic_data;

CREATE POLICY "Users can view global traffic data" 
ON traffic_data 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create global traffic data" 
ON traffic_data 
FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update global traffic data" 
ON traffic_data 
FOR UPDATE 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can delete global traffic data" 
ON traffic_data 
FOR DELETE 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Políticas para sites_data  
DROP POLICY IF EXISTS "All users can view all sites data" ON sites_data;
DROP POLICY IF EXISTS "All users can create sites data" ON sites_data;
DROP POLICY IF EXISTS "All users can update all sites data" ON sites_data;
DROP POLICY IF EXISTS "All users can delete all sites data" ON sites_data;

CREATE POLICY "Users can view global sites data" 
ON sites_data 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create global sites data" 
ON sites_data 
FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update global sites data" 
ON sites_data 
FOR UPDATE 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can delete global sites data" 
ON sites_data 
FOR DELETE 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Políticas para column_config e status_config também permitem dados globais
DROP POLICY IF EXISTS "All users can view all column config" ON column_config;
DROP POLICY IF EXISTS "All users can create column config" ON column_config;
DROP POLICY IF EXISTS "All users can update all column config" ON column_config;
DROP POLICY IF EXISTS "All users can delete all column config" ON column_config;

CREATE POLICY "Users can view global column config" 
ON column_config 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create global column config" 
ON column_config 
FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update global column config" 
ON column_config 
FOR UPDATE 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can delete global column config" 
ON column_config 
FOR DELETE 
USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "All users can view all status config" ON status_config;
DROP POLICY IF EXISTS "All users can create status config" ON status_config;
DROP POLICY IF EXISTS "All users can update all status config" ON status_config;
DROP POLICY IF EXISTS "All users can delete all status config" ON status_config;

CREATE POLICY "Users can view global status config" 
ON status_config 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create global status config" 
ON status_config 
FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update global status config" 
ON status_config 
FOR UPDATE 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can delete global status config" 
ON status_config 
FOR DELETE 
USING (user_id IS NULL OR auth.uid() = user_id);