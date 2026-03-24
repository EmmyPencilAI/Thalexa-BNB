import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  dbReady: boolean;
  signIn: (provider?: 'google' | 'facebook') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (!sessionUser) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile: UserProfile = {
          id: userId,
          email: sessionUser.email || '',
          wallet_address: `0x${Math.random().toString(16).slice(2, 42)}`, // Generate a mock wallet for now
          role: 'user',
          subscription_tier: 'starter',
          created_at: new Date().toISOString(),
        };

        const { data: createdData, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;
        setUser(createdData);
      } else if (data) {
        setUser(data);
      } else if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Profile fetch/create error:', err.message);
      if (err.message.includes('relation "profiles" does not exist')) {
        setDbReady(false);
      }
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (provider: 'google' | 'facebook' = 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Auth Error:', error.message);
      alert(`Authentication failed: ${error.message}. Ensure ${provider} is enabled in your Supabase Dashboard under Auth > Providers.`);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, dbReady, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
