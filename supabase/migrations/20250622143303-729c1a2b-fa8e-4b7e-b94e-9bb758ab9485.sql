
-- Atualizar o usuário admin com o hash SHA-256 correto
UPDATE public.app_users 
SET password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
WHERE username = 'admin';
