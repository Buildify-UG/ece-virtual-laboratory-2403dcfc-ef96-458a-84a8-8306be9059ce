import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, auth, userProfiles } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setError(null);
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(`Session error: ${sessionError.message}`);
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted && data?.session?.user) {
          setUser(data.session.user);
          await loadProfile(data.session.user.id);
        } else {
          if (isMounted) setLoading(false);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (isMounted) {
          setError(`Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      try {
        setError(null);
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(`Auth error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await userProfiles.getProfile(userId);
      if (error) {
        // Profile doesn't exist, create it
        const { data: newProfile } = await userProfiles.createProfile(
          userId,
          `user_${userId.slice(0, 8)}`,
          undefined
        );
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, fullName?: string) => {
    const { data, error } = await auth.signUp(email, password, username, fullName);
    if (error) throw error;
    if (data.user) {
      setUser(data.user);
      await loadProfile(data.user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password);
    if (error) throw error;
    if (data.user) {
      setUser(data.user);
      await loadProfile(data.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
