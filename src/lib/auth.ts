import { supabase } from "./supabase";
import { Tables, TablesInsert, TablesUpdate } from "../types/database";

export type User = Tables<"users">;
export type UserInsert = TablesInsert<"users">;
export type UserUpdate = TablesUpdate<"users">;

export class AuthService {
  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google sign in error:", error);
      throw error;
    }

    return data;
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  /**
   * Get the current authenticated user
   */
  static async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Get current user error:", error);
      return null;
    }
    return user;
  }

  /**
   * Get user profile from the users table
   */
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      // Use direct REST API call with anon key (RLS disabled)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 406) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error("💥 Profile query failed:", error);
      return null;
    }
  }

  /**
   * Create a new user profile
   */
  static async createUserProfile(
    profileData: Omit<UserInsert, "id">
  ): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user found");
    }

    const insertData: UserInsert = {
      id: user.id,
      ...profileData,
      email: profileData.email || user.email || "",
    };

    const { data, error } = await supabase
      .from("users")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Create user profile error:", error);
      throw error;
    }

    return data;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updates: UserUpdate
  ): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Update user profile error:", error);
      throw error;
    }

    return data;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(
    callback: (event: string, session: unknown) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  }
}
