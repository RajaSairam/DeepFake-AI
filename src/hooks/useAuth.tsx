import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import {
  MockUser,
  authSignUp,
  authSignIn,
  authSignOut,
  getSession,
} from "@/lib/mockDb";

// We reuse the shape expected by the rest of the app (id, email, etc.)
export type AuthUser = MockUser;

interface AuthContextType {
  user: AuthUser | null;
  session: AuthUser | null; // kept for compat; same as user
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    const stored = getSession();
    setUser(stored);
    setLoading(false);
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ error: Error | null }> => {
    const { user: newUser, error } = authSignUp(email, password, fullName);
    if (newUser && !error) {
      // Auto sign-in after registration
      authSignIn(email, password);
      setUser(newUser);
    }
    return { error };
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    const { user: loggedIn, error } = authSignIn(email, password);
    if (loggedIn && !error) {
      setUser(loggedIn);
    }
    return { error };
  };

  const signOut = async () => {
    authSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session: user, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}