-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create saved deals table
CREATE TABLE public.saved_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL,
  units INTEGER NOT NULL DEFAULT 1,
  bpo_value NUMERIC NOT NULL,
  strike_price NUMERIC NOT NULL,
  rehab_costs NUMERIC NOT NULL,
  hold_period INTEGER NOT NULL,
  exit_strategy TEXT NOT NULL,
  sale_price NUMERIC NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  roi NUMERIC,
  irr NUMERIC,
  profit NUMERIC,
  verdict TEXT,
  ai_insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_deals ENABLE ROW LEVEL SECURITY;

-- Saved deals policies
CREATE POLICY "Users can view their own deals" 
ON public.saved_deals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deals" 
ON public.saved_deals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals" 
ON public.saved_deals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals" 
ON public.saved_deals FOR DELETE 
USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_deals_updated_at
  BEFORE UPDATE ON public.saved_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();