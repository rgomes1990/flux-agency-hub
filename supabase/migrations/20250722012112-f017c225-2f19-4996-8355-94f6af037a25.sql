-- Create table for RSG Avaliações data
CREATE TABLE public.rsg_avaliacoes_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  group_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_color TEXT DEFAULT 'bg-purple-500',
  is_expanded BOOLEAN DEFAULT true,
  item_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rsg_avaliacoes_data ENABLE ROW LEVEL SECURITY;

-- Create policies for RSG Avaliações data
CREATE POLICY "Users can create global RSG Avaliações data" 
ON public.rsg_avaliacoes_data 
FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can view global RSG Avaliações data" 
ON public.rsg_avaliacoes_data 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update global RSG Avaliações data" 
ON public.rsg_avaliacoes_data 
FOR UPDATE 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can delete global RSG Avaliações data" 
ON public.rsg_avaliacoes_data 
FOR DELETE 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_rsg_avaliacoes_data_user_id ON public.rsg_avaliacoes_data(user_id);
CREATE INDEX idx_rsg_avaliacoes_data_group_id ON public.rsg_avaliacoes_data(group_id);
CREATE INDEX idx_rsg_avaliacoes_data_created_at ON public.rsg_avaliacoes_data(created_at);