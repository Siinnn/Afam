-- Script SQL pour créer et configurer un compte admin
-- À exécuter dans le SQL Editor de Supabase après avoir créé l'utilisateur via l'interface

-- 1. Vérifier que l'utilisateur existe
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'admin@afam.com';

-- 2. Créer ou mettre à jour le profil avec le rôle admin
INSERT INTO profiles (id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@afam.com'),
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';

-- 3. Vérifier que le profil a été créé correctement
SELECT 
  u.email,
  u.created_at as user_created,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@afam.com';

-- Si tout est correct, vous devriez voir :
-- email: admin@afam.com
-- role: admin
