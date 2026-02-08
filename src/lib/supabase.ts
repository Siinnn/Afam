import { createClient } from '@supabase/supabase-js';

/**
 * Ces variables d'environnement doivent être définies dans le fichier .env.local
 * Récupérez ces valeurs depuis votre projet Supabase : Settings > API
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou clé anonyme manquante. Vérifiez vos variables d\'environnement.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
