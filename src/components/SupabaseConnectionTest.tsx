'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function testConnection() {
      try {
        // Tenter de récupérer une seule ligne de la table 'posts'
        const { error } = await supabase
          .from('posts')
          .select('*')
          .limit(1);

        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
        } else {
          setStatus('success');
        }
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || 'Erreur de connexion');
      }
    }

    testConnection();
  }, []);

  if (status === 'loading') {
    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center space-x-2">
        <Loader2 className="animate-spin text-gray-400" size={18} />
        <span className="text-sm text-gray-600">Test de connexion Supabase...</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="fixed bottom-4 right-4 bg-emerald-50 border border-emerald-200 rounded-lg shadow-lg p-3 flex items-center space-x-2">
        <CheckCircle2 className="text-emerald-600" size={18} />
        <span className="text-sm font-medium text-emerald-800">
          Connexion Supabase : OK
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg shadow-lg p-3 flex items-start space-x-2 max-w-sm">
      <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
      <div className="flex-1">
        <span className="text-sm font-medium text-red-800 block mb-1">
          Connexion Supabase : Erreur
        </span>
        <span className="text-xs text-red-700">{errorMessage}</span>
      </div>
    </div>
  );
}
