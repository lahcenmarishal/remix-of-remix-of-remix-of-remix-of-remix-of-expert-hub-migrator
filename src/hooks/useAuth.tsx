import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setLoading(false);
      // Garantit une fiche profil (nom, téléphone) pour l'affichage dans la messagerie.
      if (event === "SIGNED_IN" && next?.user) {
        const meta = next.user.user_metadata ?? {};
        const row: { id: string; full_name?: string; phone?: string } = { id: next.user.id };
        if (typeof meta["full_name"] === "string" && meta["full_name"])
          row.full_name = meta["full_name"];
        if (typeof meta["phone"] === "string" && meta["phone"]) row.phone = meta["phone"];
        supabase.from("profiles").upsert(row).then(() => undefined);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user: User | null = session?.user ?? null;

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(data === true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { session, user, loading, isAdmin };
}
