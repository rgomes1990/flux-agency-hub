-- Permitir que usuários autenticados deletem logs antigos da tabela audit_logs
-- Esta política permite deletar logs mais antigos que 30 dias
CREATE POLICY "Allow delete old audit logs" 
ON public.audit_logs 
FOR DELETE 
USING (timestamp < (NOW() - INTERVAL '30 days'));