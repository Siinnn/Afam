'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus, Loader2 } from 'lucide-react';

const articleSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  content: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
  event_date: z.string().optional(),
  image_url: z.string().url('URL invalide').optional().or(z.literal('')),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface Article {
  id: string;
  title: string;
  content: string;
  event_date: string | null;
  image_url: string | null;
  created_at: string;
}

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, isAdmin } = useRole();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
  });

  // Vérifier l'accès admin
  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, router]);

  // Charger les articles
  useEffect(() => {
    if (isAdmin) {
      fetchArticles();
    }
  }, [isAdmin]);

  // Gérer le mode édition via URL
  useEffect(() => {
    if (editId && articles.length > 0) {
      const articleToEdit = articles.find(a => a.id === editId);
      if (articleToEdit) {
        handleEdit(articleToEdit);
      }
    }
  }, [editId, articles]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
      setError('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setValue('title', article.title);
    setValue('content', article.content);
    if (article.event_date) {
      setValue('event_date', new Date(article.event_date).toISOString().split('T')[0]);
    } else {
      setValue('event_date', '');
    }
    setValue('image_url', article.image_url || '');
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const onSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const postData = {
      title: data.title,
      content: data.content,
      event_date: data.event_date ? new Date(data.event_date).toISOString() : null,
      image_url: data.image_url || null,
      is_event: !!data.event_date,
      // Only set author_id on insert, not update (optional choice, but usually author doesn't change)
      // author_id: user?.id, 
    };

    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingId);

        if (error) throw error;
        setSuccess('Article mis à jour avec succès !');
      } else {
        // Insert
        const { error } = await supabase
          .from('posts')
          .insert([{ ...postData, author_id: user?.id }]);

        if (error) throw error;
        setSuccess('Article créé avec succès !');
      }

      reset();
      setEditingId(null);
      fetchArticles();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);

      if (error) throw error;

      setSuccess('Article supprimé avec succès !');
      if (editingId === id) {
        handleCancelEdit();
      }
      fetchArticles();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la suppression');
    }
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tableau de bord Admin</h1>
          <p className="text-gray-600">Gérez les articles et événements de l'association</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulaire de création / édition */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-emerald-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center">
                <Plus className="mr-2 text-emerald-600" size={24} />
                {editingId ? 'Modifier l\'article' : 'Créer un article/événement'}
              </span>
              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Annuler
                </button>
              )}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Titre de l'article"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu *
                </label>
                <textarea
                  id="content"
                  {...register('content')}
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.content ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Contenu de l'article..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date de l'événement (optionnel)
                </label>
                <input
                  type="date"
                  id="event_date"
                  {...register('event_date')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'image (optionnel)
                </label>
                <input
                  type="url"
                  id="image_url"
                  {...register('image_url')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.image_url ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="https://exemple.com/image.jpg"
                />
                {errors.image_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      {editingId ? 'Modification...' : 'Création...'}
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="mr-2" />
                      {editingId ? 'Mettre à jour' : 'Créer l\'article'}
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Liste des articles */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-emerald-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles existants</h2>

            {articles.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Aucun article pour le moment.</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className={`p-4 border rounded-lg transition-colors ${editingId === article.id
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-gray-200 hover:border-emerald-300'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 flex-1">{article.title}</h3>
                      <div className="flex space-x-1 ml-4">
                        <button
                          onClick={() => handleEdit(article)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{article.content}</p>
                    {article.event_date && (
                      <p className="text-xs text-gray-500">
                        Date: {new Date(article.event_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Créé le {new Date(article.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
