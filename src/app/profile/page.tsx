'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';
import {
    Download,
    Trash2,
    User,
    AlertTriangle,
    Shield,
    Edit2,
    Save,
    X,
    Calendar,
    MessageSquare,
    FileText
} from 'lucide-react';

interface UserPost {
    id: string;
    title: string;
    created_at: string;
    category: string | null;
}

interface UserComment {
    id: string;
    content: string;
    created_at: string;
    post_id: string;
    posts?: {
        title: string;
    };
}

export default function ProfilePage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { role, loading: roleLoading } = useRole();
    const router = useRouter();

    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // États pour modification du profil
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // États pour l'historique
    const [userPosts, setUserPosts] = useState<UserPost[]>([]);
    const [userComments, setUserComments] = useState<UserComment[]>([]);
    const [loadingActivity, setLoadingActivity] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            setNewUsername(user.user_metadata?.username || user.email?.split('@')[0] || '');
            fetchActivity();
        }
    }, [authLoading, user, router, role]);

    const fetchActivity = async () => {
        if (!user) return;
        setLoadingActivity(true);

        try {
            if (role === 'admin') {
                const { data, error } = await supabase
                    .from('posts')
                    .select('id, title, created_at, category')
                    .eq('author_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setUserPosts(data || []);
            } else {
                const { data, error } = await supabase
                    .from('comments')
                    .select('*, posts:post_id (title)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                // @ts-ignore - Supabase types mapping for joined tables can be tricky
                setUserComments(data || []);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'activité:', error);
        } finally {
            setLoadingActivity(false);
        }
    };

    const handleUpdateUsername = async () => {
        if (!user || !newUsername.trim()) return;
        setIsUpdating(true);

        try {
            const { error: authError } = await supabase.auth.updateUser({
                data: { username: newUsername }
            });

            if (authError) throw authError;

            const { error: profileError } = await supabase
                .from('profiles')
                .update({ username: newUsername })
                .eq('id', user.id);

            if (profileError) throw profileError;

            setIsEditingUsername(false);
            // Force refresh to update Navbar etc. could involve Context reload but simple router refresh works for now
            router.refresh();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du pseudo:', error);
            alert('Erreur lors de la mise à jour.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            // 1. Récupérer les données du profil
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user!.id)
                .single();

            if (profileError) throw profileError;

            // 2. Récupérer les articles de l'utilisateur
            const { data: posts, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .eq('author_id', user!.id);

            if (postsError) throw postsError;

            // 3. assembler les données
            const userData = {
                auth_data: {
                    id: user!.id,
                    email: user!.email,
                    created_at: user!.created_at,
                    last_sign_in_at: user!.last_sign_in_at,
                },
                profile_data: profile,
                posts_data: posts,
            };

            // 4. Créer et télécharger le fichier JSON
            const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `afam_data_${user!.id}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            alert('Une erreur est survenue lors de l\'export des données.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Êtes-vous sûr de vouloir supprimer votre compte ? \n\nCETTE ACTION EST IRRÉVERSIBLE.\n\nToutes vos données personnelles seront effacées. Vos articles publics pourraient être conservés mais anonymisés ou supprimés selon la politique du site.'
        );

        if (!confirmed) return;

        setIsDeleting(true);
        try {
            // Appel à la fonction RPC pour supprimer le compte (self-service)
            const { error } = await supabase.rpc('delete_own_account');

            if (error) {
                throw error;
            }

            // Déconnexion côté client
            await signOut();
            alert('Votre compte a été supprimé avec succès.');
            router.push('/');
        } catch (error) {
            console.error('Erreur lors de la suppression du compte:', error);
            alert('Une erreur est survenue lors de la suppression du compte. Veuillez réessayer ou contacter le support.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (authLoading || roleLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-emerald-600 animate-pulse">Chargement du profil...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* En-tête du profil & Infos */}
                <div className="bg-white shadow rounded-lg p-6 sm:p-8">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="bg-emerald-100 p-3 rounded-full">
                            <User className="h-8 w-8 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
                            <p className="text-gray-500">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                        {/* Nom d'utilisateur Éditable */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Nom d'utilisateur</h3>
                            {isEditingUsername ? (
                                <div className="mt-1 flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    />
                                    <button
                                        onClick={handleUpdateUsername}
                                        disabled={isUpdating}
                                        className="p-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                                    >
                                        <Save size={16} />
                                    </button>
                                    <button
                                        onClick={() => setIsEditingUsername(false)}
                                        className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-1 flex items-center group">
                                    <p className="text-lg text-gray-900 mr-2">
                                        {newUsername}
                                    </p>
                                    <button
                                        onClick={() => setIsEditingUsername(true)}
                                        className="text-gray-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Modifier"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Rôle</h3>
                            <p className="mt-1 text-lg text-gray-900 capitalize">
                                {role === 'admin' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Administrateur
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Membre
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section Activité (Posts ou Commentaires) */}
                <div className="bg-white shadow rounded-lg p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-gray-500" />
                        Mon Activité
                    </h2>

                    {loadingActivity ? (
                        <div className="text-center py-4 text-gray-500">Chargement de l'activité...</div>
                    ) : (
                        <div className="space-y-4">
                            {role === 'admin' ? (
                                // Vue Admin : Liste des articles créés
                                userPosts.length > 0 ? (
                                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Titre</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Catégorie</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {userPosts.map((post) => (
                                                    <tr key={post.id}>
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{post.title}</td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{post.category || '-'}</td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</td>
                                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                            <Link href={`/admin/dashboard?edit=${post.id}`} className="text-emerald-600 hover:text-emerald-900">
                                                                Modifier
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                                        Vous n'avez écrit aucun article.
                                    </div>
                                )
                            ) : (
                                // Vue Utilisateur : Liste des commentaires
                                userComments.length > 0 ? (
                                    <ul role="list" className="divide-y divide-gray-200">
                                        {userComments.map((comment) => (
                                            <li key={comment.id} className="py-4">
                                                <div className="flex space-x-3">
                                                    <MessageSquare className="h-6 w-6 text-gray-400" />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="text-sm font-medium">
                                                                Sur : <Link href={`/articles/${comment.post_id}`} className="text-emerald-600 hover:underline">{comment.posts?.title || 'Article inconnu'}</Link>
                                                            </h3>
                                                            <p className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <p className="text-sm text-gray-500 line-clamp-2">"{comment.content}"</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                                        Vous n'avez posté aucun commentaire.
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Section Gestion des données (GDPR) */}
                <div className="bg-white shadow rounded-lg p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-gray-500" />
                        Gestion de mes données
                    </h2>

                    <div className="space-y-6">
                        {/* Export des données */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="mb-4 sm:mb-0">
                                <h3 className="text-lg font-medium text-gray-900">Exporter mes données</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Téléchargez une copie de vos données personnelles au format JSON.
                                </p>
                            </div>
                            <button
                                onClick={handleExportData}
                                disabled={isExporting}
                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? 'Export en cours...' : 'Exporter'}
                            </button>
                        </div>

                        {/* Zone de danger : Suppression de compte */}
                        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="ml-3 w-full">
                                    <h3 className="text-lg font-medium text-red-800">Zone de danger</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>
                                            La suppression de votre compte est définitive. Toutes vos données seront effacées de nos serveurs.
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting}
                                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {isDeleting ? 'Suppression...' : 'Supprimer mon compte'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
