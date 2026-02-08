-- 1. Ajout de la colonne email à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Mise à jour de la fonction de création de profil
-- Adapte la fonction pour gérer les métadonnées (username) et l'email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- Priorité : Username fourni lors de l'inscription > Extrait de l'email
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. (Optionnel) Mettre à jour les utilisateurs existants
-- Remplit la colonne email pour les profils déjà créés
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND (p.email IS NULL OR p.email = '');
