import { useState, createContext, useContext } from 'react';
import { supabase, SupabaseProvider } from './index.js';
import { useQueryClient } from '@tanstack/react-query';

const SupabaseAuthContext = createContext();

export const SupabaseAuthProvider = ({ children }) => {
  return (
    <SupabaseProvider>
      <SupabaseAuthProviderInner>
        {children}
      </SupabaseAuthProviderInner>
    </SupabaseProvider>
  );
}

export const SupabaseAuthProviderInner = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_table')
      .select('*')
      .eq('user_id', email)
      .eq('password', password)
      .single();

    if (error) {
      console.error('Error during login:', error);
      setLoading(false);
      return { error: 'Invalid login credentials' };
    }

    if (data) {
      setSession({ user: data });
      queryClient.invalidateQueries('user');
      setLoading(false);
      return { session: { user: data } };
    }

    setLoading(false);
    return { error: 'Invalid login credentials' };
  };

  const logout = () => {
    setSession(null);
    queryClient.invalidateQueries('user');
  };

  return (
    <SupabaseAuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  return useContext(SupabaseAuthContext);
};

export const SupabaseAuthUI = () => null; // Remove this component as we're not using Supabase Auth UI
