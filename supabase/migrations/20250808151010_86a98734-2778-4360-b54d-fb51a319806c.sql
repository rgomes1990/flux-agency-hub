-- Corrigir políticas RLS da tabela client_passwords para permitir dados globais compartilhados
-- Remover políticas existentes que restringem acesso
DROP POLICY IF EXISTS "Allow users to manage client passwords" ON client_passwords;
DROP POLICY IF EXISTS "Client passwords access for authenticated users" ON client_passwords;

-- Criar políticas para permitir dados globais (user_id IS NULL) acessíveis por todos
CREATE POLICY "Allow all operations on global client passwords" 
ON client_passwords 
FOR ALL 
USING (user_id IS NULL)
WITH CHECK (user_id IS NULL);

-- Política para usuários autenticados gerenciarem seus próprios dados
CREATE POLICY "Users can manage their own client passwords" 
ON client_passwords 
FOR ALL 
USING (user_id IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

-- Política adicional para permitir que todos os usuários autenticados vejam dados globais e de outros usuários
CREATE POLICY "Authenticated users can view all client passwords" 
ON client_passwords 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Permitir que usuários autenticados criem dados globais
CREATE POLICY "Authenticated users can create global client passwords" 
ON client_passwords 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);