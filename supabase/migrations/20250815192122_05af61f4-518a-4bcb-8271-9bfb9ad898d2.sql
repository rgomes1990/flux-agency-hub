-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create content_padarias_data table
CREATE TABLE public.content_padarias_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  group_name TEXT NOT NULL,
  group_color TEXT DEFAULT '#3b82f6',
  elemento TEXT NOT NULL,
  observacoes TEXT,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_padarias_data ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view content padarias data" 
ON public.content_padarias_data 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create content padarias data" 
ON public.content_padarias_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update content padarias data" 
ON public.content_padarias_data 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete content padarias data" 
ON public.content_padarias_data 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_content_padarias_data_updated_at
BEFORE UPDATE ON public.content_padarias_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();