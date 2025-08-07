-- Verificar e corrigir as políticas RLS da tabela videos_data para permitir operações globais
-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can create global videos data" ON videos_data;
DROP POLICY IF EXISTS "Users can view global videos data" ON videos_data; 
DROP POLICY IF EXISTS "Users can update global videos data" ON videos_data;
DROP POLICY IF EXISTS "Users can delete global videos data" ON videos_data;

-- Criar políticas mais permissivas para dados globais (user_id IS NULL)
CREATE POLICY "Allow all operations on global videos data" 
ON videos_data 
FOR ALL 
USING (user_id IS NULL)
WITH CHECK (user_id IS NULL);

-- Política adicional para usuários autenticados acessarem seus próprios dados
CREATE POLICY "Users can manage their own videos data" 
ON videos_data 
FOR ALL 
USING (user_id IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);