

-- Primeiro, vamos criar uma tabela de usuários personalizada no banco
CREATE TABLE IF NOT EXISTS public.app_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.app_users(id),
  is_active BOOLEAN DEFAULT true
);

-- Habilitar RLS na tabela de usuários
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam todos os outros usuários (necessário para login)
CREATE POLICY "Users can view all users" 
  ON public.app_users 
  FOR SELECT 
  USING (true);

-- Política para permitir que usuários autenticados criem novos usuários
CREATE POLICY "Authenticated users can create users" 
  ON public.app_users 
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir que usuários atualizem outros usuários
CREATE POLICY "Users can update all users" 
  ON public.app_users 
  FOR UPDATE 
  USING (true);

-- Política para permitir que usuários excluam outros usuários
CREATE POLICY "Users can delete all users" 
  ON public.app_users 
  FOR DELETE 
  USING (true);

-- Criar tabela de auditoria para rastrear todas as modificações
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES public.app_users(id),
  user_username TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam todos os logs de auditoria
CREATE POLICY "Users can view all audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (true);

-- Política para permitir inserção de logs de auditoria
CREATE POLICY "System can insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Limpar qualquer usuário admin existente
DELETE FROM public.app_users WHERE username = 'admin';

-- Criar um usuário admin padrão (senha: admin123) com hash SHA-256 correto
INSERT INTO public.app_users (username, password_hash, created_at)
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', now());

