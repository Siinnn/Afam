-- Fonction pour permettre à un utilisateur de supprimer son propre compte
-- Cette fonction doit être appelée via RPC depuis le client Supabase

create or replace function delete_own_account()
returns void
language plpgsql
security definer
as $$
begin
  -- Vérifier que l'utilisateur est bien connecté
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Supprimer l'utilisateur de la table auth.users
  -- Cela devrait déclencher des suppressions en cascade si les FK sont configurées (ON DELETE CASCADE)
  -- Sinon, il faudra supprimer manuellement les données liées avant (profiles, posts, etc.)
  delete from auth.users where id = auth.uid();
end;
$$;
