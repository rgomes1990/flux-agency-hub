-- Criar tabela para observações padrão
CREATE TABLE IF NOT EXISTS public.default_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  module TEXT NOT NULL,
  text TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.default_observations ENABLE ROW LEVEL SECURITY;

-- Create policies for default observations
CREATE POLICY "Users can view global default observations" 
ON public.default_observations 
FOR SELECT 
USING ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can create global default observations" 
ON public.default_observations 
FOR INSERT 
WITH CHECK ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can update global default observations" 
ON public.default_observations 
FOR UPDATE 
USING ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can delete global default observations" 
ON public.default_observations 
FOR DELETE 
USING ((user_id IS NULL) OR (auth.uid() = user_id));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_default_observations_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_default_observations_updated_at
BEFORE UPDATE ON public.default_observations
FOR EACH ROW
EXECUTE FUNCTION public.update_default_observations_updated_at_column();