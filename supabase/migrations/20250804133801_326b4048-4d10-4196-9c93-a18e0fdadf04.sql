-- Create videos_data table identical to content_data
CREATE TABLE public.videos_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  is_expanded boolean DEFAULT true,
  item_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  group_id text NOT NULL,
  group_name text NOT NULL,
  group_color text DEFAULT 'bg-purple-500'::text
);

-- Enable Row Level Security
ALTER TABLE public.videos_data ENABLE ROW LEVEL SECURITY;

-- Create policies identical to content_data
CREATE POLICY "Users can create global videos data" 
ON public.videos_data 
FOR INSERT 
WITH CHECK ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can view global videos data" 
ON public.videos_data 
FOR SELECT 
USING ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can update global videos data" 
ON public.videos_data 
FOR UPDATE 
USING ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can delete global videos data" 
ON public.videos_data 
FOR DELETE 
USING ((user_id IS NULL) OR (auth.uid() = user_id));