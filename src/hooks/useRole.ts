'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Role = 'admin' | 'user' | null;

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erreur lors de la récupération du rôle:', error);
          setRole(null);
        } else {
          setRole((data?.role as 'admin' | 'user') || 'user');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user]);

  return { role, loading, isAdmin: role === 'admin', isUser: role === 'user' };
}
