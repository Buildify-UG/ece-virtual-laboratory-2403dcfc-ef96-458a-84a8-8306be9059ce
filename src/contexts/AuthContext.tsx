import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, auth, userProfiles } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Helper function to convert auth errors to user-friendly messages
function getAuthErrorMessage(error: any): string {
  if (!error) return 'Unknown error occurred';
  
  const message = error.message || '';
  const code = error.code || '';

  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check and try again.';
  }
  if (message.includes('User already registered')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (message.includes('Password')) {
    return 'Password must be at least 6 characters.';
  }
  if (message.includes('Email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('network') || code === 'ERR_NETWORK') {
    return 'Network error. Please check your connection and try again.';
  }
  if (message.includes('database') || code === 'PGRST') {
    return 'Database error. Please try again later.';
  }
  
  return message || 'Authentication failed. Please try again.';
}

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
      
      if (error && error.code !== 'PGRST116') {
        // Only log non-404 errors
        console.error('Profile fetch error:', error);
        setError(`Failed to load profile: ${error.message}`);
        setLoading(false);
        return;
      }

      if (!data) {
        // Profile doesn't exist, create it
        const generatedUsername = `user_${userId.slice(0, 8)}`;
        const { data: newProfile, error: createError } = await userProfiles.createProfile(
          userId,
          generatedUsername,
          undefined
        );
        
        if (createError) {
          console.error('Profile creation error:', createError);
          setError(`Failed to create profile: ${createError.message}`);
          setLoading(false);
          return;
        }

        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(`Profile error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, fullName?: string) => {
    try {
      setError(null);
      const { data, error } = await auth.signUp(email, password, username, fullName);
      
      if (error) {
        const errorMsg = getAuthErrorMessage(error);
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (data.user) {
        setUser(data.user);
        await loadProfile(data.user.id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMsg);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        const errorMsg = getAuthErrorMessage(error);
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (data.user) {
        setUser(data.user);
        await loadProfile(data.user.id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await auth.signOut();
      
      if (error) {
        setError(`Logout failed: ${error.message}`);
        throw error;
      }

      setUser(null);
      setProfile(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMsg);
      throw err;
    }
  };

  const clearError = () => setError(null);

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
