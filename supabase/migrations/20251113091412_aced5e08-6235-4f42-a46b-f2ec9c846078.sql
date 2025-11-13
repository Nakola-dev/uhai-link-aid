-- Create webinars table
CREATE TABLE IF NOT EXISTS public.webinars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  speaker TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;

-- Public can view all webinars
CREATE POLICY "Webinars are publicly readable"
ON public.webinars
FOR SELECT
USING (true);

-- Only admins can manage webinars
CREATE POLICY "Admins can manage webinars"
ON public.webinars
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_webinars_updated_at
BEFORE UPDATE ON public.webinars
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create downloadable_materials table
CREATE TABLE IF NOT EXISTS public.downloadable_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT,
  category TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.downloadable_materials ENABLE ROW LEVEL SECURITY;

-- Public can view all materials
CREATE POLICY "Materials are publicly readable"
ON public.downloadable_materials
FOR SELECT
USING (true);

-- Only admins can manage materials
CREATE POLICY "Admins can manage materials"
ON public.downloadable_materials
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON public.downloadable_materials
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create articles table for public learn page
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  read_time INTEGER,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public can view all articles
CREATE POLICY "Articles are publicly readable"
ON public.articles
FOR SELECT
USING (true);

-- Only admins can manage articles
CREATE POLICY "Admins can manage articles"
ON public.articles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();