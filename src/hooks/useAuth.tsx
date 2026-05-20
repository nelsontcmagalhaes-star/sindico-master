import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, signOut: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();
  const lastUserId = useRef<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const handleSession = (s: Session | null) => {
      const newUid = s?.user?.id ?? null;
      // Se o usuário mudou (login, logout, troca de conta) — limpar cache do React Query
      if (initialized.current && lastUserId.current !== newUid) {
        qc.clear();
      }
      lastUserId.current = newUid;
      initialized.current = true;
      setSession(s);
      setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => handleSession(s));
    supabase.auth.getSession().then(({ data }) => handleSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, [qc]);

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
          qc.clear();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
