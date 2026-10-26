import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Server-side admin verification via edge function
  const verifyAdminServerSide = async (accessToken: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const response = await supabase.functions.invoke('verify-admin', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.error) {
        console.error("Error verifying admin status:", response.error);
        return false;
      }

      return response.data?.isAdmin === true;
    } catch (error) {
      console.error("Error calling verify-admin function:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && session.access_token) {
          // Verify admin status server-side
          setTimeout(async () => {
            const adminStatus = await verifyAdminServerSide(session.access_token);
            setIsAdmin(adminStatus);
            setIsLoading(false);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && session.access_token) {
        const adminStatus = await verifyAdminServerSide(session.access_token);
        setIsAdmin(adminStatus);
      }
      setIsLoading(false);
    }).catch(() => {
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error("خدمة تسجيل الدخول غير متاحة حالياً") };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
