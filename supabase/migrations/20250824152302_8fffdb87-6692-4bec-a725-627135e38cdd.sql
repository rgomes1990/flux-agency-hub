
-- Add missing columns to content_data table
ALTER TABLE public.content_data 
ADD COLUMN IF NOT EXISTS elemento text,
ADD COLUMN IF NOT EXISTS servicos text,
ADD COLUMN IF NOT EXISTS observacoes text,
ADD COLUMN IF NOT EXISTS attachments jsonb;

-- Update existing records to have default values for new columns
UPDATE public.content_data 
SET 
  elemento = COALESCE(elemento, ''),
  servicos = COALESCE(servicos, ''),
  observacoes = COALESCE(observacoes, ''),
  attachments = COALESCE(attachments, '[]'::jsonb)
WHERE elemento IS NULL OR servicos IS NULL OR observacoes IS NULL OR attachments IS NULL;
