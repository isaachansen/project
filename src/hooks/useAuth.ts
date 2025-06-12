import { useState, useEffect, useCallback, useRef } from "react";
import { User as AuthUser } from "@supabase/supabase-js";
import { AuthService, User, UserInsert, UserUpdate } from "../lib/auth";
import { supabase } from "../lib/supabase";

interface AuthState {
  user: AuthUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null,
  });

  const loadingProfileRef = useRef(false);
  const profileCacheRef = useRef<{ userId: string; profile: User } | null>(
    null
  );

  // Load user profile with proper error handling and caching
  const loadUserProfile = useCallback(async (userId: string) => {
    // Check cache first
    if (profileCacheRef.current?.userId === userId) {
      setState((prev) => ({
        ...prev,
        userProfile: profileCacheRef.current!.profile,
      }));
      return;
    }

    // Prevent multiple simultaneous loads
    if (loadingProfileRef.current) {
      return;
    }

    loadingProfileRef.current = true;

    try {
      const profile = await AuthService.getUserProfile(userId);
      if (profile) {
        // Cache the profile
        profileCacheRef.current = { userId, profile };
        setState((prev) => ({ ...prev, userProfile: profile }));
      } else {
        setState((prev) => ({ ...prev, userProfile: null }));
      }
    } catch (error) {
      console.error("❌ Failed to load user profile:", error);
      setState((prev) => ({
        ...prev,
        userProfile: null,
        error:
          error instanceof Error ? error.message : "Failed to load profile",
      }));
    } finally {
      loadingProfileRef.current = false;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First get the session to ensure auth state is properly loaded
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setState((prev) => ({ ...prev, user: session.user, loading: false }));
          // Only load profile if we don't already have it cached
          if (
            !profileCacheRef.current ||
            profileCacheRef.current.userId !== session.user.id
          ) {
            await loadUserProfile(session.user.id);
          } else {
            // Use cached profile
            setState((prev) => ({
              ...prev,
              userProfile: profileCacheRef.current!.profile,
            }));
          }
        } else {
          setState((prev) => ({
            ...prev,
            user: null,
            userProfile: null,
            loading: false,
          }));
        }
      } catch (error) {
        if (!mounted) return;

        console.error("🚨 Auth initialization error:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : "Authentication failed",
        }));
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      const authSession = session as { user?: AuthUser } | null;
      if (authSession?.user) {
        setState((prev) => ({ ...prev, user: authSession.user! }));
        await loadUserProfile(authSession.user.id);
      } else {
        // Clear cache on sign out
        profileCacheRef.current = null;
        setState((prev) => ({ ...prev, user: null, userProfile: null }));
      }

      setState((prev) => ({ ...prev, loading: false }));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // Auth actions
  const signIn = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));
      await AuthService.signInWithGoogle();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign in failed";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AuthService.signOut();
      setState((prev) => ({
        ...prev,
        user: null,
        userProfile: null,
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign out failed";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  const createProfile = useCallback(
    async (profileData: Omit<UserInsert, "id">) => {
      try {
        setState((prev) => ({ ...prev, error: null }));
        const profile = await AuthService.createUserProfile(profileData);
        setState((prev) => ({ ...prev, userProfile: profile }));
        return profile;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Profile creation failed";
        setState((prev) => ({ ...prev, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  const updateProfile = useCallback(
    async (updates: UserUpdate) => {
      if (!state.user) {
        throw new Error("No user logged in");
      }

      try {
        setState((prev) => ({ ...prev, error: null }));
        const profile = await AuthService.updateUserProfile(
          state.user.id,
          updates
        );
        setState((prev) => ({ ...prev, userProfile: profile }));
        return profile;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Profile update failed";
        setState((prev) => ({ ...prev, error: errorMessage }));
        throw error;
      }
    },
    [state.user]
  );

  return {
    user: state.user,
    userProfile: state.userProfile,
    loading: state.loading,
    error: state.error,
    signIn,
    signOut,
    createProfile,
    updateProfile,
  };
}
