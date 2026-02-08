# Configuration Supabase pour AFAM

Ce document décrit la structure de la base de données nécessaire pour le site AFAM.

## Tables requises

### 1. Table `profiles`

Cette table stocke les profils utilisateurs avec leurs rôles.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Table `posts`

Cette table stocke les articles et événements.

```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_event BOOLEAN DEFAULT false,
  event_date TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Table `comments`

Cette table stocke les commentaires sur les posts.

```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Table `contacts`

Cette table stocke les messages de contact.

```sql
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuration RLS (Row Level Security)

### RLS pour `profiles`

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Politique : Les utilisateurs peuvent lire tous les profils (pour afficher les noms)
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  USING (true);

-- Politique : Les utilisateurs peuvent créer leur propre profil (à la première connexion)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Politique : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### RLS pour `posts`

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les posts
CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  USING (true);

-- Politique : Seuls les admins peuvent créer des posts
CREATE POLICY "Only admins can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique : Seuls les admins peuvent modifier/supprimer des posts
CREATE POLICY "Only admins can update posts"
  ON posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete posts"
  ON posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### RLS pour `comments`

```sql
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les commentaires visibles
CREATE POLICY "Anyone can read visible comments"
  ON comments FOR SELECT
  USING (is_visible = true);

-- Politique : Seuls les utilisateurs connectés peuvent créer des commentaires
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent modifier/supprimer leurs propres commentaires
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);
```

### RLS pour `contacts`

```sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut créer des contacts (formulaire public)
CREATE POLICY "Anyone can create contacts"
  ON contacts FOR INSERT
  WITH CHECK (true);

-- Politique : Seuls les admins peuvent lire les contacts
CREATE POLICY "Only admins can read contacts"
  ON contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique : Seuls les admins peuvent mettre à jour les contacts
CREATE POLICY "Only admins can update contacts"
  ON contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## Fonction pour créer automatiquement un profil

Créez une fonction qui crée automatiquement un profil lorsqu'un utilisateur s'inscrit :

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Cette fonction récupère l'email de l'utilisateur authentifié et son username (soit depuis les métadonnées, soit extrait de l'email par défaut).

## Configuration de l'authentification

### Création d'un utilisateur admin

Pour créer un compte admin et avoir accès à toutes les fonctionnalités, suivez ces étapes :

#### Méthode 1 : Via l'interface Supabase (Recommandé)

1. **Allez dans votre projet Supabase** → **Authentication** → **Users**
2. **Cliquez sur "Add user"** → **"Create new user"**
3. **Remplissez le formulaire** :
   - **Email** : `admin@afam.com`
   - **Password** : Choisissez un mot de passe sécurisé
   - **Auto Confirm User** : ✅ Cochez cette case (important pour éviter la vérification email)
4. **Cliquez sur "Create user"**

5. **Une fois l'utilisateur créé**, allez dans **SQL Editor** dans Supabase et exécutez ce script :

```sql
-- Mettre à jour le profil pour définir le rôle admin
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@afam.com');
```

6. **Vérifiez que le profil a été créé et mis à jour** :

```sql
-- Vérifier le profil admin
SELECT 
  u.email,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@afam.com';
```

#### Méthode 2 : Création directe via SQL (Avancé)

Si vous préférez créer l'utilisateur directement via SQL :

```sql
-- 1. Créer l'utilisateur dans auth.users (nécessite les extensions Supabase)
-- Note: Cette méthode nécessite d'utiliser l'API Supabase Admin ou l'interface web

-- 2. Une fois l'utilisateur créé, créer/mettre à jour le profil admin
INSERT INTO profiles (id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@afam.com'),
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';
```

#### Connexion avec le compte admin

Une fois le compte créé, vous pouvez vous connecter sur votre site :

1. Allez sur `/login`
2. **Pseudo** : `admin` (sans le @afam.com)
3. **Mot de passe** : Le mot de passe que vous avez défini

Le système convertira automatiquement `admin` en `admin@afam.com` pour l'authentification Supabase.

#### Vérification des permissions

Après connexion, vous devriez voir :
- Un lien "Admin" dans la navbar
- Accès à `/admin/dashboard`
- Possibilité de créer et supprimer des articles

### Notes importantes

- Les utilisateurs se connectent avec un **pseudo** qui est automatiquement converti en `pseudo@afam.com` pour Supabase Auth
- Assurez-vous que les emails dans Supabase Auth suivent le format `pseudo@afam.com`
- Le système vérifie automatiquement le rôle dans la table `profiles` pour déterminer les permissions

## Variables d'environnement

Créez un fichier `.env.local` avec :

```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

Ces valeurs se trouvent dans votre projet Supabase : Settings > API
