
-- Remover as políticas existentes de sites_data
DROP POLICY IF EXISTS "Users can view their own sites data" ON public.sites_data;
DROP POLICY IF EXISTS "Users can create their own sites data" ON public.sites_data;
DROP POLICY IF EXISTS "Users can update their own sites data" ON public.sites_data;
DROP POLICY IF EXISTS "Users can delete their own sites data" ON public.sites_data;

-- Criar políticas compartilhadas para sites_data (todos podem ver e modificar tudo)
CREATE POLICY "All users can view all sites data" 
  ON public.sites_data 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "All users can create sites data" 
  ON public.sites_data 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All users can update all sites data" 
  ON public.sites_data 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "All users can delete all sites data" 
  ON public.sites_data 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Fazer o mesmo para traffic_data
DROP POLICY IF EXISTS "Allow users to manage traffic data" ON public.traffic_data;
DROP POLICY IF EXISTS "Traffic data access for authenticated users" ON public.traffic_data;

CREATE POLICY "All users can view all traffic data" 
  ON public.traffic_data 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "All users can create traffic data" 
  ON public.traffic_data 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All users can update all traffic data" 
  ON public.traffic_data 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "All users can delete all traffic data" 
  ON public.traffic_data 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Fazer o mesmo para column_config
DROP POLICY IF EXISTS "Allow users to manage column config" ON public.column_config;
DROP POLICY IF EXISTS "Column config access for authenticated users" ON public.column_config;

CREATE POLICY "All users can view all column config" 
  ON public.column_config 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "All users can create column config" 
  ON public.column_config 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All users can update all column config" 
  ON public.column_config 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "All users can delete all column config" 
  ON public.column_config 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Fazer o mesmo para status_config
DROP POLICY IF EXISTS "Allow users to manage status config" ON public.status_config;
DROP POLICY IF EXISTS "Status config access for authenticated users" ON public.status_config;

CREATE POLICY "All users can view all status config" 
  ON public.status_config 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "All users can create status config" 
  ON public.status_config 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All users can update all status config" 
  ON public.status_config 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "All users can delete all status config" 
  ON public.status_config 
  FOR DELETE 
  TO authenticated
  USING (true);
