-- 1. Supprimer le trigger existant pour éviter les conflits
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Créer ou remplacer la fonction de gestion des nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- Utiliser le username des métadonnées ou la partie gauche de l'email
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    'user' -- Rôle par défaut : 'user' (visiteur)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recréer le trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. (Optionnel) Créer les profils manquants pour les utilisateurs existants
INSERT INTO public.profiles (id, email, username, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'username', SPLIT_PART(email, '@', 1)),
  'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
