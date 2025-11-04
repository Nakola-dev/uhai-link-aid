-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid primary key references auth.users on delete cascade not null,
  full_name text,
  phone text,
  blood_type text,
  allergies text[] default '{}',
  medications text[] default '{}',
  chronic_conditions text[] default '{}',
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  role text default 'user',
  updated_at timestamptz default now()
);

-- QR access tokens table
create table qr_access_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  access_token text unique not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Emergency organizations table (public)
create table emergency_organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- Tutorials table (public)
create table tutorials (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  video_url text,
  created_at timestamptz default now()
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Enable RLS on qr_access_tokens
alter table qr_access_tokens enable row level security;

-- QR tokens policies
create policy "Users can view their own QR tokens"
  on qr_access_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert their own QR tokens"
  on qr_access_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own QR tokens"
  on qr_access_tokens for update
  using (auth.uid() = user_id);

-- Public access for emergency organizations
alter table emergency_organizations enable row level security;
create policy "Emergency organizations are publicly readable"
  on emergency_organizations for select
  using (true);

-- Public access for tutorials
alter table tutorials enable row level security;
create policy "Tutorials are publicly readable"
  on tutorials for select
  using (true);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$;

-- Trigger for auto-creating profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert emergency organizations
insert into emergency_organizations (name, type, phone, email) values
  ('Kenya Red Cross', 'Ambulance', '1199', 'info@redcross.or.ke'),
  ('Aga Khan Hospital', 'Hospital', '+254711091111', 'info@aku.edu'),
  ('St. John Ambulance', 'First Aid', '+254722208208', 'stjohn@ambulance.or.ke'),
  ('Nairobi Hospital', 'Hospital', '+254202845000', 'info@nbihosp.or.ke'),
  ('Gertrudes Hospital', 'Hospital', '+254207722000', 'info@gerties.org');

-- Insert tutorials
insert into tutorials (title, description, video_url) values
  ('How to Update Your Profile', 'Keep your medical information current and accurate', 'https://youtube.com/watch?v=demo1'),
  ('Sharing Your QR Code', 'Learn how to print, wear, or share your QR code safely', 'https://youtube.com/watch?v=demo2'),
  ('What Responders See', 'Demo of what emergency responders can access', 'https://youtube.com/watch?v=demo3'),
  ('Managing Emergency Contacts', 'Add and update your emergency contact information', 'https://youtube.com/watch?v=demo4');

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for profiles updated_at
create trigger handle_profiles_updated_at
  before update on profiles
  for each row execute procedure handle_updated_at();

-- Trigger for qr_access_tokens updated_at
create trigger handle_qr_tokens_updated_at
  before update on qr_access_tokens
  for each row execute procedure handle_updated_at();