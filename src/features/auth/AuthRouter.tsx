import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { getAppConfig } from "@/lib/config";
import { initializeSlack } from "@/lib/slack";
import { LoginScreen } from "@/components/LoginScreen";
import { ProfileSetup } from "@/components/ProfileSetup";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { LoadingScreen } from "@/features/common/LoadingScreen";
import { ErrorScreen } from "@/features/common/ErrorScreen";
import { SupabaseSetupScreen } from "@/features/common/SupabaseSetupScreen";
import { User, UserUpdate } from "@/lib/auth";

export function AuthRouter() {
  useTheme();

  useEffect(() => {
    const config = getAppConfig();
    if (config.slack.enabled) {
      try {
        initializeSlack();
      } catch (error) {
        console.error("❌ Failed to initialize Slack service:", error);
      }
    }
  }, []);

  const {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signOut,
    createProfile,
    updateProfile,
  } = useAuth();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleUpdateProfile = async (updates: UserUpdate) => {
    try {
      await updateProfile(updates);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
    return <SupabaseSetupScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen onSignIn={signIn} loading={loading} />;
  }

  if (!userProfile) {
    return (
      <ProfileSetup
        user={user}
        onComplete={(profileData) =>
          createProfile(profileData as Omit<User, "id">)
        }
      />
    );
  }

  return (
    <Dashboard
      user={user}
      userProfile={userProfile}
      onSignOut={signOut}
      onUpdateProfile={handleUpdateProfile}
    />
  );
}
