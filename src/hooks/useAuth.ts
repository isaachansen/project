import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthService } from '../lib/auth';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      setError('Supabase configuration missing');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error.message);
      } else {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserProfile(session.user.id);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await AuthService.getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signIn = async () => {
    try {
      setError(null);
      await AuthService.signInWithGoogle();
    } catch (error: any) {
      console.error('Error signing in:', error);
      setError(error.message || 'Failed to sign in');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error.message || 'Failed to sign out');
      throw error;
    }
  };

  const createProfile = async (profileData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const profile = await AuthService.createUserProfile(profileData);
      setUserProfile(profile);
      return profile;
    } catch (error: any) {
      console.error('Error creating profile:', error);
      setError(error.message || 'Failed to create profile');
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      const profile = await AuthService.updateUserProfile(user.id, updates);
      setUserProfile(profile);
      return profile;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
      throw error;
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signOut,
    createProfile,
    updateProfile
  };
}