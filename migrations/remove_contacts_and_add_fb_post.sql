-- Supprimer la table contacts car on utilise maintenant des liens directs
DROP TABLE IF EXISTS public.contacts;

-- Ajouter le post Facebook
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Récupérer un ID d'admin pour l'auteur
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  -- S'il n'y a pas d'admin, on essaie de prendre n'importe quel user, sinon NULL
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM profiles LIMIT 1;
  END IF;

  -- Insérer le post
  INSERT INTO public.posts (title, excerpt, content, category, event_date, created_at, author_id)
  VALUES (
    'Retrouvez l''AFAM sur Facebook',
    'Suivez toute l''actualité de l''association en direct sur notre page Facebook officielle.',
    'L''Association des Femmes Actives de Mutsamudu (A.F.A.M) est très active sur les réseaux sociaux.
    
    Nous vous invitons à consulter notre dernier post et à suivre notre page pour ne rien manquer de nos actions, notamment notre lutte contre la pollution et nos initiatives communautaires.
    
    Visitez notre page ici : https://www.facebook.com/p/AFAM-100088315476380/?locale=fr_FR',
    'Actualités',
    NOW(),
    NOW(),
    admin_id
  );
END $$;
