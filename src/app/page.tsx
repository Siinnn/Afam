// Revalidate data every 60 seconds (ISR)
export const revalidate = 60;

import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import FacebookFeed from '@/components/FacebookFeed';
import PostCard from '@/components/PostCard';

export default async function Home() {
  // Récupération des articles depuis Supabase
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Section Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Association AFAM
              <span className="block text-emerald-600 mt-2">Mutsamudu</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              L'association des femmes actives de Mutsamudu (A.F.A.M) est une ONG qui lutte principalement contre la pollution des déchets.

              AFAM-PROTÉGEONS NOTRE ÎLE🏝️ PRÉSERVONS NOTRE AVENIR🐾

              🌿Ensemble contre la pollution, pour un Mutsamudu propre et durable 🌍


            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/events"
                className="inline-flex items-center justify-center px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-lg"
              >
                Découvrir nos événements
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-emerald-600 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-lg"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section Contenu Principal : Articles + Facebook */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Colonne Principale: Articles (2/3 largeur) */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Dernières actualités</h2>
              <Link href="/posts?category=Actualité" className="text-emerald-600 hover:text-emerald-700 font-medium hidden sm:block">
                Voir tous les articles →
              </Link>
            </div>

            <div className="space-y-8">
              {posts && posts.length > 0 ? (
                posts.map((article) => (
                  <PostCard key={article.id} post={article} />
                ))
              ) : (
                <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg">
                  <p>Aucune actualité pour le moment.</p>
                </div>
              )}
            </div>

            <div className="text-center sm:hidden mt-6">
              <Link href="/posts?category=Actualité" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Voir tous les articles →
              </Link>
            </div>
          </div>

          {/* Colonne Latérale: Facebook (1/3 largeur) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FacebookFeed />


            </div>
          </div>

        </div>
      </section>

      {/* Section CTA */}
      <section className="bg-emerald-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Rejoignez-nous</h2>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            Participez à nos activités et contribuez au développement de notre communauté
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-lg"
          >
            Devenir membre
          </Link>
        </div>
      </section>


    </main>
  );
}
