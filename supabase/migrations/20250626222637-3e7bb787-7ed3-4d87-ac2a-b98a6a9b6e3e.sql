
-- Criar tabela para dados de criação de sites
CREATE TABLE public.sites_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  group_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_color TEXT DEFAULT 'bg-green-500',
  is_expanded BOOLEAN DEFAULT true,
  item_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security) 
ALTER TABLE public.sites_data ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view their own sites data" 
  ON public.sites_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Criar política para que usuários possam inserir seus próprios dados
CREATE POLICY "Users can create their own sites data" 
  ON public.sites_data 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Criar política para que usuários possam atualizar seus próprios dados
CREATE POLICY "Users can update their own sites data" 
  ON public.sites_data 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Criar política para que usuários possam deletar seus próprios dados
CREATE POLICY "Users can delete their own sites data" 
  ON public.sites_data 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_sites_data_user_id ON public.sites_data(user_id);
CREATE INDEX idx_sites_data_group_id ON public.sites_data(group_id);
