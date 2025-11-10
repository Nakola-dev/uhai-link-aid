-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table with proper RLS
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Create emergency_contacts table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN gender TEXT,
ADD COLUMN date_of_birth DATE,
ADD COLUMN city TEXT,
ADD COLUMN county TEXT,
ADD COLUMN profile_photo_url TEXT,
ADD COLUMN primary_hospital TEXT;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for emergency_contacts
CREATE POLICY "Users can view their own emergency contacts"
ON public.emergency_contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency contacts"
ON public.emergency_contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts"
ON public.emergency_contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts"
ON public.emergency_contacts FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all emergency contacts"
ON public.emergency_contacts FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all emergency contacts"
ON public.emergency_contacts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles RLS policies for admin access
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to ensure admin user exists on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'admin@gmail.com' THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;

  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$;

-- Update trigger to use new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for emergency_contacts updated_at
CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();