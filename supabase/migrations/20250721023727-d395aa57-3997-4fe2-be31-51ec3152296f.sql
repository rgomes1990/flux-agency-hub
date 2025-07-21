-- Create table for Google My Business data
CREATE TABLE public.google_my_business_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  group_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_color TEXT DEFAULT 'bg-blue-500',
  is_expanded BOOLEAN DEFAULT true,
  item_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.google_my_business_data ENABLE ROW LEVEL SECURITY;

-- Create policies for Google My Business data (similar to traffic_data)
CREATE POLICY "Users can create global Google My Business data" 
ON public.google_my_business_data 
FOR INSERT 
WITH CHECK ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can view global Google My Business data" 
ON public.google_my_business_data 
FOR SELECT 
USING ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can update global Google My Business data" 
ON public.google_my_business_data 
FOR UPDATE 
USING ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can delete global Google My Business data" 
ON public.google_my_business_data 
FOR DELETE 
USING ((user_id IS NULL) OR (auth.uid() = user_id));

-- Create indexes for better performance
CREATE INDEX idx_google_my_business_data_group_id ON public.google_my_business_data(group_id);
CREATE INDEX idx_google_my_business_data_user_id ON public.google_my_business_data(user_id);
CREATE INDEX idx_google_my_business_data_created_at ON public.google_my_business_data(created_at);