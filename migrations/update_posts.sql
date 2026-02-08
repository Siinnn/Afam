-- Ajout des colonnes manquantes
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- Insertion des données de test (News placeholders)
-- On utilise ON CONFLICT DO NOTHING pour éviter les doublons si on relance le script, 
-- mais idélament on devrait vérifier l'existence par titre ou autre car l'ID est généré.
-- Ici on insère simplement, si ça doublonne c'est pas critique pour du dév local, 
-- mais pour faire propre on va vérifier si le titre existe.

DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Récupérer un ID d'admin pour l'auteur (facultatif, sinon NULL ou un user par défaut)
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  -- S'il n'y a pas d'admin, on essaie de prendre n'importe quel user, sinon NULL
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM profiles LIMIT 1;
  END IF;

  -- Article 1
  IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Nouvelle initiative pour la jeunesse de Mutsamudu') THEN
    INSERT INTO public.posts (title, excerpt, content, category, event_date, created_at, author_id)
    VALUES (
      'Nouvelle initiative pour la jeunesse de Mutsamudu',
      'L''AFAM lance un nouveau programme d''accompagnement pour les jeunes de la région...',
      'L''Association AFAM est fière d''annoncer le lancement de son nouveau programme dédié à la jeunesse de Mutsamudu. Ce programme vise à offrir un accompagnement personnalisé aux jeunes porteurs de projets, qu''ils soient culturels, sportifs ou entrepreneuriaux.

      À travers des ateliers réguliers et un mentorat assuré par des professionnels expérimentés, nous souhaitons donner aux jeunes les moyens de leurs ambitions. Les inscriptions sont d''ores et déjà ouvertes et nous invitons tous les intéressés à nous contacter pour plus d''informations.',
      'Actualités',
      '2026-01-15',
      '2026-01-15',
      admin_id
    );
  END IF;

  -- Article 2
  IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Célébration de la Journée de la Culture Comorienne') THEN
    INSERT INTO public.posts (title, excerpt, content, category, event_date, created_at, author_id)
    VALUES (
      'Célébration de la Journée de la Culture Comorienne',
      'Retour sur la magnifique célébration qui a rassemblé plus de 500 personnes...',
      'La Journée de la Culture Comorienne a été un véritable succès cette année. Plus de 500 personnes se sont rassemblées pour célébrer notre patrimoine riche et vibrant. Au programme : danses traditionnelles, dégustation de plats locaux, et expositions d''artisanat.

      Cet événement a permis de renforcer les liens intergénérationnels et de rappeler l''importance de préserver nos traditions tout en regardant vers l''avenir. Merci à tous les bénévoles qui ont rendu cette journée possible.',
      'Événements',
      '2026-01-08',
      '2026-01-08',
      admin_id
    );
  END IF;

  -- Article 3
  IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Atelier de formation en entrepreneuriat') THEN
    INSERT INTO public.posts (title, excerpt, content, category, event_date, created_at, author_id)
    VALUES (
      'Atelier de formation en entrepreneuriat',
      'Un atelier gratuit pour développer vos compétences entrepreneuriales...',
      'Dans le cadre de notre engagement pour le développement économique local, l''AFAM organise un atelier gratuit sur les bases de l''entrepreneuriat. Cet atelier s''adresse à tous ceux qui souhaitent se lancer dans l''aventure entrepreneuriale mais qui ne savent pas par où commencer.

      Nous aborderons des sujets tels que l''étude de marché, le business plan, et les démarches administratives. Rejoignez-nous pour acquérir les outils nécessaires à la réussite de votre projet.',
      'Formation',
      '2026-01-02',
      '2026-01-02',
      admin_id
    );
  END IF;

END $$;
