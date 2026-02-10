# AFAM Web - Guide de Présentation Technique

Ce document est conçu pour vous aider à présenter le projet **AFAM Web** de manière pédagogique. Il explique l'architecture, les choix technologiques et le fonctionnement du code.

---

## 1. Contexte et Besoins (Pourquoi ce projet ?)

L'Association des Femmes Actives de Mutsamudu (AFAM) avait plusieurs problématiques :
1.  **Manque de visibilité** : Les actions de l'association étaient peu connues en dehors du cercle des membres.
2.  **Information dispersée** : Les événements et actualités étaient communiqués par le bouche-à-oreille ou des groupes WhatsApp fermés, limitant leur portée.
3.  **Gestion des membres** : Aucun outil ne permettait de fédérer la communauté ou de gérer facilement les adhésions et les échanges.

**La Solution : AFAM Web**
Une plateforme centralisée pour :
*   **Rayonner** : Une vitrine publique accessible à tous (locaux et diaspora).
*   **Informer** : Un "hub" unique pour toutes les actualités et l'agenda.
*   **Fédérer** : Un espace membre pour créer du lien et de l'engagement (commentaires, profils).

---

## 2. L'Architecture Technique (La "Stack")

Pour construire ce site, nous avons utilisé des technologies modernes et performantes :

*   **Next.js (Framework React)** : C'est le cœur du projet. Il gère l'affichage des pages et la navigation.
    *   *Pourquoi ce choix ?* Contrairement à React seul qui s'affiche entièrement dans le navigateur du client (Client-Side Rendering), Next.js pré-génère les pages sur le serveur (Server-Side Rendering).
    *   **Avantaage N°1 : Le SEO (Référencement)**. Google et les réseaux sociaux peuvent lire facilement le contenu du site, ce qui est crucial pour la visibilité de l'association.
    *   **Avantage N°2 : La Performance**. Le site se charge plus vite car l'utilisateur reçoit une page déjà construite, pas une page vide qui doit tout télécharger.
    *   **Avantage N°3 : Tout-en-un**. Il inclut déjà le routage (navigation), l'optimisation des images et le support TypeScript. Avec React seul, il aurait fallu installer et configurer 5 ou 6 bibliothèques supplémentaires.
*   **Supabase (Backend-as-a-Service)** : Il remplace un serveur traditionnel. Il gère :
    *   La base de données (PostgreSQL).
    *   L'authentification (Inscriptions, Connexions).
    *   Le stockage des images.
*   **Tailwind CSS (Styles)** : Pour le design. Au lieu d'écrire des fichiers CSS séparés, on utilise des classes utilitaires directement dans le code (ex: `text-red-500` pour du texte rouge).
*   **TypeScript** : Une version améliorée de JavaScript qui ajoute des "types" pour éviter les bugs (ex: dire qu'une variable `age` doit être un nombre et pas du texte).

---

## 3. Structure du Code (Organisation des fichiers)

Le projet suit l'organisation standard de **Next.js App Router** :

```
src/
├── app/              # C'est ici que vivent les pages !
│   ├── page.tsx      # La page d'accueil (/)
│   ├── login/        # La page de connexion (/login)
│   ├── profile/      # La page de profil (/profile)
│   └── layout.tsx    # Le squelette commun à toutes les pages (Navbar, Footer)
├── components/       # Les briques LEGO réutilisables
│   ├── Navbar.tsx    # La barre de navigation
│   ├── Footer.tsx    # Le pied de page
│   └── PostCard.tsx  # Une carte pour afficher un article
├── contexts/         # La gestion de l'état global (ex: l'utilisateur connecté)
│   └── AuthContext.tsx
└── lib/              # Les outils techniques
    └── supabase.ts   # La connexion à la base de données
```

---

## 4. Zoom sur les Fonctionnalités Clés

### A. L'Authentification (`AuthContext.tsx`)
C'est le gardien de l'application.
*   **Rôle** : Il vérifie en permanence si un utilisateur est connecté ou non.
*   **Fonctionnement** : Il utilise Supabase pour savoir "qui est là" et met cette information à disposition de toute l'application. Si vous êtes connecté, la barre de navigation affiche "Mon Profil", sinon elle affiche "Connexion".

### B. Gestion des Rôles (`useRole.ts`)
Nous avons deux types d'utilisateurs : **Membres** et **Administrateurs**.
*   Le "Hook" `useRole` interroge la table `profiles` dans la base de données.
*   Si le rôle est `admin`, l'utilisateur voit le tableau de bord et peut modifier des articles.
*   Si le rôle est `user` (défaut), il peut seulement commenter.

### C. La Page Profil & RGPD (`src/app/profile/page.tsx`)
C'est une fonctionnalité majeure pour la conformité légale (RGPD).
*   **Affichage** : Montre les infos de l'utilisateur.
*   **Modification** : Permet de changer son pseudo (mise à jour en base de données).
*   **Droit à l'oubli** : Le bouton "Supprimer mon compte" appelle une fonction spéciale sécurisée (`RPC`) sur le serveur pour tout effacer.
*   **Portabilité** : Le bouton "Exporter" génère un fichier JSON avec toutes les données de l'utilisateur.

### D. La Sécurité (Sécurité "By Design")
La sécurité n'est pas une option, elle est intégrée au cœur du framework :
1.  **Injections SQL** : Impossible ici. Nous n'écrivons pas de requêtes SQL brutes dans le code. Supabase utilise une API sécurisée (PostgREST) qui "nettoie" automatiquement toutes les données envoyées.
2.  **Tokens d'Authentification (JWT)** : Pas de stockage de mot de passe en clair. Supabase gère des "JSON Web Tokens". Ces jetons sont sécurisés, expirent rapidement et se renouvellent automatiquement sans que l'utilisateur s'en rende compte.
3.  **RLS (Row Level Security)** : C'est notre pare-feu au niveau de la donnée. Même si quelqu'un arrivait à interroger la base de données, il ne verrait que **ses** données. Les règles interdisent par exemple à un utilisateur lambda de modifier un article ou de voir l'email d'un autre membre.
4.  **XSS (Cross-Site Scripting)** : React protège contre l'injection de scripts malveillants en "échappant" automatiquement tout contenu avant de l'afficher.

---

## 5. Exemple de Code Expliqué (Pour la démo)

Prenons un extrait simplifié de la page Profil :

```tsx
// On récupère l'utilisateur connecté
const { user } = useAuth();

// Fonction pour sauvegarder le nouveau pseudo
const handleUpdateUsername = async () => {
    // 1. On envoie la demande à Supabase (Base de données)
    const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.id); // "Met à jour OÙ l'id est celui de l'utilisateur"

    // 2. Si c'est bon, on rafraîchit la page
    if (!error) router.refresh();
};
```

**Ce qu'il faut retenir** :
Le code est **déclaratif**. On décrit *quoi faire* (mettre à jour le profil) et Next.js/Supabase s'occupent du *comment*.

---

## 6. Évolutions et Passage à l'Échelle

Une question fréquente est : *"Que se passe-t-il si le site devient très populaire ?"*

### A. Si la base de données sature (Supabase)
Actuellement, nous utilisons l'offre gratuite de Supabase, généreuse pour une association. Si le trafic explose :
1.  **Passage au plan Pro** : Pour quelques dollars, Supabase gère la montée en charge automatiquement.
2.  **Auto-hébergement** : Supabase est "Open Source". On peut l'installer sur nos propres serveurs (via Docker) pour ne plus dépendre de leur cloud.
3.  **Migration PostgreSQL** : Comme c'est du standard SQL, on peut migrer les données vers n'importe quel autre hébergeur (AWS, OVH) sans réécrire le code du site.

### B. Pistes d'Amélioration du Site
Pour aller plus loin, nous pourrions ajouter :
*   **Newsletter** : Pour envoyer les actualités par mail automatiquement.
*   **Billetterie** : Pour gérer les inscriptions aux événements directement sur le site.
*   **Mode Sombre** : Pour le confort visuel le soir.
*   **Application Mobile (PWA)** : Transformer le site en application installable sur téléphone sans passer par l'App Store.

---

## 7. Conclusion pour la présentation

Ce projet démontre une application web **complète** et **sécurisée**.
Il respecte les standards modernes (RGPD, Sécurité, Performance) et offre une base solide pour le développement futur de l'association AFAM.
