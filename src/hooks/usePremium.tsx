import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const ADMIN_EMAIL = "nelsontcmagalhaes@gmail.com";

export function usePremium() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, premium_expires_at")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
  });

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isPremium = isAdmin || !!profile?.is_premium;

  return { isPremium, isAdmin, profile };
}
