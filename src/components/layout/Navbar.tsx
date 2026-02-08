'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';

export default function Navbar() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { role, isAdmin } = useRole();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Nom de l'association */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-emerald-600">AFAM</span>
            <span className="text-sm text-gray-600 hidden sm:inline">Mutsamudu</span>
          </Link>

          {/* Liens de navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Accueil
            </Link>
            <Link
              href="/events"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Événements
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Contact
            </Link>
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium flex items-center"
              >
                <Shield size={16} className="mr-1" />
                Admin
              </Link>
            )}
          </div>

          {/* Bouton Connexion/Déconnexion */}
          {loading ? (
            <div className="px-4 py-2 text-gray-400">Chargement...</div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-gray-700">
                <User size={18} />
                <span className="text-sm font-medium">
                  {user.user_metadata?.username || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <LogIn size={18} />
              <span>Connexion</span>
            </Link>
          )}

          {/* Menu mobile (simplifié) */}
          <div className="md:hidden flex items-center space-x-4">
            <Link
              href="/events"
              className="text-gray-700 hover:text-emerald-600 transition-colors text-sm"
            >
              Événements
            </Link>
            {user ? (
              <button onClick={handleSignOut} className="p-2 text-emerald-600">
                <LogOut size={20} />
              </button>
            ) : (
              <Link href="/login" className="p-2 text-emerald-600">
                <LogIn size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
