/*
  # Complete Uhai Assist Link Database Schema

  1. Extensions & Types
    - UUID extension
    - app_role enum (admin, user)
    - chat_role enum (user, assistant)
    - admin_action_type enum (create, update, delete, view, export)

  2. Core Tables
    - profiles: User health information
    - user_roles: Role assignments
    - emergency_contacts: User emergency contacts
    - qr_access_tokens: QR code access tokens
    - emergency_organizations: Directory of emergency services
    - organization_services: Services offered by organizations
    - tutorials: Learning center content
    - user_learning_progress: User progress tracking
    - chat_history: AI assistant conversations
    - admin_logs: Audit trail
    - analytics: Platform metrics
    - articles, webinars, downloadable_materials: Content tables

  3. Security
    - RLS enabled on all tables
    - Role-based access control
    - User data isolation
    - Admin-only audit trails

  4. Functions & Triggers
    - handle_new_user: Auto-create profile on signup
    - has_role: Check user role
    - handle_updated_at: Update timestamp trigger
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.chat_role AS ENUM ('user', 'assistant');
CREATE TYPE public.admin_action_type AS ENUM ('create', 'update', 'delete', 'view', 'export');

-- Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  chronic_conditions TEXT[] DEFAULT '{}',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  gender TEXT,
  date_of_birth DATE,
  city TEXT,
  county TEXT,
  profile_photo_url TEXT,
  primary_hospital TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create QR access tokens table
CREATE TABLE IF NOT EXISTS public.qr_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  access_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create emergency_organizations table
CREATE TABLE IF NOT EXISTS public.emergency_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create organization_services table
CREATE TABLE IF NOT EXISTS public.organization_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.emergency_organizations(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  service_description TEXT,
  availability_hours TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tutorials table
CREATE TABLE IF NOT EXISTS public.tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_learning_progress table
CREATE TABLE IF NOT EXISTS public.user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tutorial_id)
);

-- Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  read_time INTEGER,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create webinars table
CREATE TABLE IF NOT EXISTS public.webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  speaker TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create downloadable_materials table
CREATE TABLE IF NOT EXISTS public.downloadable_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT,
  category TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  role public.chat_role NOT NULL,
  conversation_id TEXT NOT NULL,
  model_used TEXT DEFAULT 'gpt-3.5-turbo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type public.admin_action_type NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  description TEXT,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- Create function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
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

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role public.app_role;
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

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloadable_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view their own emergency contacts"
  ON public.emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency contacts"
  ON public.emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts"
  ON public.emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts"
  ON public.emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all emergency contacts"
  ON public.emergency_contacts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all emergency contacts"
  ON public.emergency_contacts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for qr_access_tokens
CREATE POLICY "Users can view their own QR tokens"
  ON public.qr_access_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own QR tokens"
  ON public.qr_access_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR tokens"
  ON public.qr_access_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all QR tokens"
  ON public.qr_access_tokens FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all QR tokens"
  ON public.qr_access_tokens FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for emergency_organizations (public read)
CREATE POLICY "Emergency organizations are publicly readable"
  ON public.emergency_organizations FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage emergency organizations"
  ON public.emergency_organizations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for organization_services (public read)
CREATE POLICY "Organization services are publicly readable"
  ON public.organization_services FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage organization services"
  ON public.organization_services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tutorials (public read)
CREATE POLICY "Tutorials are publicly readable"
  ON public.tutorials FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tutorials"
  ON public.tutorials FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_learning_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_learning_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.user_learning_progress FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for articles (public read)
CREATE POLICY "Articles are publicly readable"
  ON public.articles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage articles"
  ON public.articles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for webinars (public read)
CREATE POLICY "Webinars are publicly readable"
  ON public.webinars FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage webinars"
  ON public.webinars FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for downloadable_materials (public read)
CREATE POLICY "Materials are publicly readable"
  ON public.downloadable_materials FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage materials"
  ON public.downloadable_materials FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for chat_history
CREATE POLICY "Users can view their own chat history"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all chat history"
  ON public.chat_history FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_logs (admin only)
CREATE POLICY "Admins can view all admin logs"
  ON public.admin_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert admin logs"
  ON public.admin_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for analytics (admin only)
CREATE POLICY "Admins can view all analytics"
  ON public.analytics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert analytics"
  ON public.analytics FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_qr_access_tokens_updated_at
BEFORE UPDATE ON public.qr_access_tokens
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tutorials_updated_at
BEFORE UPDATE ON public.tutorials
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_learning_progress_updated_at
BEFORE UPDATE ON public.user_learning_progress
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_webinars_updated_at
BEFORE UPDATE ON public.webinars
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON public.downloadable_materials
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_chat_history_updated_at
BEFORE UPDATE ON public.chat_history
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_analytics_updated_at
BEFORE UPDATE ON public.analytics
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_emergency_organizations_updated_at
BEFORE UPDATE ON public.emergency_organizations
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_organization_services_updated_at
BEFORE UPDATE ON public.organization_services
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for auth.users to auto-create profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX idx_qr_access_tokens_user_id ON public.qr_access_tokens(user_id);
CREATE INDEX idx_qr_access_tokens_token ON public.qr_access_tokens(access_token);
CREATE INDEX idx_user_learning_progress_user_id ON public.user_learning_progress(user_id);
CREATE INDEX idx_user_learning_progress_tutorial_id ON public.user_learning_progress(tutorial_id);
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX idx_chat_history_conversation_id ON public.chat_history(conversation_id);
CREATE INDEX idx_chat_history_created_at ON public.chat_history(created_at);
CREATE INDEX idx_admin_logs_admin_user_id ON public.admin_logs(admin_user_id);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at);
CREATE INDEX idx_admin_logs_entity_type ON public.admin_logs(entity_type);
CREATE INDEX idx_analytics_metric_key ON public.analytics(metric_key);
CREATE INDEX idx_analytics_date_recorded ON public.analytics(date_recorded);
CREATE INDEX idx_organization_services_organization_id ON public.organization_services(organization_id);

-- Insert seed data for emergency organizations
INSERT INTO public.emergency_organizations (name, type, phone, email) VALUES
  ('Kenya Red Cross', 'Ambulance', '1199', 'info@redcross.or.ke'),
  ('Aga Khan Hospital', 'Hospital', '+254711091111', 'info@aku.edu'),
  ('St. John Ambulance', 'First Aid', '+254722208208', 'stjohn@ambulance.or.ke'),
  ('Nairobi Hospital', 'Hospital', '+254202845000', 'info@nbihosp.or.ke'),
  ('Gertrudes Hospital', 'Hospital', '+254207722000', 'info@gerties.org');

-- Insert seed data for tutorials
INSERT INTO public.tutorials (title, description, video_url) VALUES
  ('How to Update Your Profile', 'Keep your medical information current and accurate', 'https://youtube.com/watch?v=demo1'),
  ('Sharing Your QR Code', 'Learn how to print, wear, or share your QR code safely', 'https://youtube.com/watch?v=demo2'),
  ('What Responders See', 'Demo of what emergency responders can access', 'https://youtube.com/watch?v=demo3'),
  ('Managing Emergency Contacts', 'Add and update your emergency contact information', 'https://youtube.com/watch?v=demo4');
