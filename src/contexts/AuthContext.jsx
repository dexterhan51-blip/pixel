import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Fetch profile from Supabase profiles table
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Profile fetch exception:', err);
      return null;
    }
  }, []);

  // Update profile in Supabase
  const updateProfile = useCallback(async (updates) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return null;
      }
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Profile update exception:', err);
      return null;
    }
  }, [user]);

  // Initialize auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).then((p) => {
          setProfile(p);
          if (p && !p.onboarding_complete) {
            setIsFirstLogin(true);
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const p = await fetchProfile(currentSession.user.id);
          setProfile(p);

          if (event === 'SIGNED_IN') {
            // Check if this is a brand new user (first login)
            if (p && !p.onboarding_complete) {
              setIsFirstLogin(true);
            }
          }
        } else {
          setProfile(null);
          setIsFirstLogin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signInWithKakao = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error('Kakao login error:', error);
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error);
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsFirstLogin(false);
    return { error };
  }, []);

  const value = {
    session,
    user,
    profile,
    isLoading,
    isFirstLogin,
    setIsFirstLogin,
    signInWithKakao,
    signOut,
    fetchProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
