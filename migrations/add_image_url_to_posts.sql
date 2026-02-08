-- Ajout de la colonne image_url si elle n'existe pas
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Ajout d'un commentaire pour la documentation
COMMENT ON COLUMN public.posts.image_url IS 'URL de l''image principale de l''article. Peut être un lien externe ou interne.';
