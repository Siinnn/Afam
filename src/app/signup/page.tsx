'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const signupSchema = z.object({
    username: z.string().min(2, 'Le pseudo doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsSubmitting(true);
        setError(null);

        // @ts-ignore - updated signature in AuthContext
        const { error, data: authData } = await signUp(data.email, data.password, data.username);

        if (error) {
            if (error.message.includes('rate limit')) {
                setError('Trop de tentatives d\'inscription. Veuillez patienter quelques minutes avant de réessayer.');
            } else {
                setError(error.message || 'Une erreur est survenue lors de l\'inscription.');
            }
            setIsSubmitting(false);
            return;
        }

        if (authData?.user && !authData.session) {
            // Utilisateur créé mais pas de session => Email confirmation requise
            setError('Compte créé ! Veuillez vérifier vos emails pour confirmer votre inscription avant de vous connecter.');
            setIsSubmitting(false);
            return;
        }

        if (!authData?.user) {
            setError('Erreur inattendue : aucun utilisateur créé.');
            setIsSubmitting(false);
            return;
        }

        router.push('/');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-emerald-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Inscription</h1>
                    <p className="text-gray-600">Rejoignez la communauté AFAM</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <AlertCircle className="text-red-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Pseudo
                        </label>
                        <input
                            type="text"
                            id="username"
                            {...register('username')}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.username ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="Votre pseudo"
                            autoComplete="username"
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            {...register('email')}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="votre@email.com"
                            autoComplete="email"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            {...register('password')}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.password ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="Choisissez un mot de passe"
                            autoComplete="new-password"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            {...register('confirmPassword')}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="Confirmez votre mot de passe"
                            autoComplete="new-password"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            'Inscription...'
                        ) : (
                            <>
                                <UserPlus size={18} className="mr-2" />
                                S'inscrire
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-4">
                    <p className="text-sm text-gray-600">
                        Déjà un compte ?{' '}
                        <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                            Se connecter
                        </Link>
                    </p>
                    <Link
                        href="/"
                        className="block text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                        ← Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
