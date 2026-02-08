import { supabase } from '@/lib/supabase';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

export const revalidate = 60;

export default async function PostsPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const params = await searchParams;
    const categoryFilter = params.category;

    let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (categoryFilter) {
        query = query.eq('category', categoryFilter);
    }

    const { data: posts } = await query;

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {categoryFilter ? `Articles : ${categoryFilter}` : 'Tous nos articles'}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Retrouvez toutes les actualités, événements et projets de l'association AFAM.
                    </p>

                    <div className="mt-8 flex justify-center gap-4 flex-wrap">
                        <Link
                            href="/posts"
                            className={`px-4 py-2 rounded-full transition-colors ${!categoryFilter ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'}`}
                        >
                            Tout voir
                        </Link>
                        <Link
                            href="/posts?category=Actualité"
                            className={`px-4 py-2 rounded-full transition-colors ${categoryFilter === 'Actualité' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'}`}
                        >
                            Actualités
                        </Link>
                        <Link
                            href="/posts?category=Événement"
                            className={`px-4 py-2 rounded-full transition-colors ${categoryFilter === 'Événement' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'}`}
                        >
                            Événements
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts && posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm border border-emerald-50">
                            <p className="text-gray-500 text-lg">Aucun article trouvé.</p>
                            {categoryFilter && (
                                <Link href="/posts" className="text-emerald-600 hover:underline mt-2 inline-block">
                                    Voir tous les articles
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
