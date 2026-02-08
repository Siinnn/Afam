'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, User, Send, Loader2, ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const commentSchema = z.object({
  content: z.string().min(3, 'Le commentaire doit contenir au moins 3 caractères'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  event_date: string | null;
  image_url: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string | null;
  };
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  useEffect(() => {
    if (params.id) {
      fetchArticle();
      fetchComments();
    }
  }, [params.id]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error: any) {

      setError('Article introuvable');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .eq('post_id', params.id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      // console.error('Erreur lors du chargement des commentaires:', error);
    }
  };

  const onSubmit = async (data: CommentFormData) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.from('comments').insert([
        {
          post_id: params.id,
          user_id: user.id,
          content: data.content,
        },
      ]);

      if (error) throw error;

      reset();
      fetchComments();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article introuvable</h1>
          <Link
            href="/"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Bouton retour */}
        <Link
          href="/"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Retour à l'accueil
        </Link>

        {/* Bouton Modifier (Admin seulement) */}
        {isAdmin && article && (
          <Link
            href={`/admin/dashboard?edit=${article.id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-6 ml-4"
          >
            <Edit size={18} className="mr-2" />
            Modifier l'article
          </Link>
        )}

        {/* Article */}
        <article className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-emerald-50">
          {article.image_url && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <Image
                src={article.image_url}
                alt={article.title}
                width={800}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>

          <div className="flex items-center text-gray-600 mb-6 space-x-4">
            {article.event_date && (
              <div className="flex items-center">
                <Calendar size={18} className="mr-2 text-emerald-600" />
                <span>{new Date(article.event_date).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            {article.category && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200">
                {article.category}
              </span>
            )}
            <div className="flex items-center">
              <span className="text-sm">
                Publié le {new Date(article.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{article.content}</p>
          </div>
        </article>

        {/* Section commentaires */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-emerald-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Commentaires ({comments.length})
          </h2>

          {/* Formulaire de commentaire */}
          {user ? (
            <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <textarea
                  {...register('content')}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.content ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Écrivez votre commentaire..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Publier le commentaire
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-800 text-sm">
                <Link href="/login" className="font-medium underline">
                  Connectez-vous
                </Link>{' '}
                pour poster un commentaire.
              </p>
            </div>
          )}

          {/* Liste des commentaires */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                Aucun commentaire pour le moment. Soyez le premier à commenter !
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start mb-2">
                    <User size={20} className="text-emerald-600 mr-2 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.profiles?.username || 'Utilisateur'}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
