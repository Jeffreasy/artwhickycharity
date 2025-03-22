-- Controleer of de trigger functie correct is en herstel indien nodig
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Maak een vereenvoudigde versie van de trigger functie die geen errors zou moeten geven
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Probeer alleen het ID en email in te voegen, zonder extra velden
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error naar Postgres log maar laat de gebruiker wel aanmaken
  RAISE NOTICE 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Controleer of de trigger al bestaat en maak deze anders opnieuw aan
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Controleer of de profiles tabel bestaat, en maak deze indien nodig
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Zorg ervoor dat RLS is ingeschakeld op de profiles tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Controleer of er beleid is ingesteld, en maak ze opnieuw aan indien nodig
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Maak een policy zodat nieuwe gebruikers hun eigen profiel kunnen aanmaken
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Maak een beleid zodat profielen automatisch aangemaakt kunnen worden door de trigger
DROP POLICY IF EXISTS "System can create profiles" ON public.profiles;

CREATE POLICY "System can create profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (TRUE); 