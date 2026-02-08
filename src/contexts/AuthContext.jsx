import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Fetch profile from Supabase profiles table
  const fetchProfile = useCallback(async (userId) => {
    if (!isSupabaseConfigured) return null;
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
    if (!user || !isSupabaseConfigured) return null;
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
    // Supabase 미설정 시 바로 로딩 해제
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // 안전장치: 3초 후 강제 로딩 해제
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      clearTimeout(timeout);
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
    }).catch((err) => {
      clearTimeout(timeout);
      console.error('Auth session error:', err);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const p = await fetchProfile(currentSession.user.id);
          setProfile(p);

          if (event === 'SIGNED_IN') {
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

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInAnonymously = useCallback(async () => {
    if (!isSupabaseConfigured) return { error: new Error('Supabase not configured') };
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Anonymous sign-in error:', error);
        return { error };
      }
      return { data, error: null };
    } catch (err) {
      console.error('Anonymous sign-in exception:', err);
      return { error: err };
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error);
    // Clear local app data so next anonymous user starts fresh
    localStorage.removeItem('pixel-tennis-data-v1');
    localStorage.removeItem('pixel-tennis-sync-queue');
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
    signInAnonymously,
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
