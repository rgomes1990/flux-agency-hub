-- Adicionar campo item_data como JSON para armazenar dados dinâmicos
ALTER TABLE content_padarias_data 
ADD COLUMN item_data jsonb;