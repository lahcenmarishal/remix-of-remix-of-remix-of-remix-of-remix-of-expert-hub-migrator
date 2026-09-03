import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Notifie les professeurs concernés qu'une nouvelle demande est disponible.
 * Volontairement accessible sans session : une demande peut être créée par un
 * visiteur non connecté (demande directe à un professeur). Une garde anti-doublon
 * évite toute création répétée pour la même demande.
 */
export const notifyNewRequest = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ requestId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const link = `/pro/demandes?r=${data.requestId}`;
    const { data: existing } = await supabaseAdmin
      .from("notifications")
      .select("id")
      .eq("link", link)
      .limit(1);
    if (existing && existing.length > 0) return { notified: 0 };

    const { data: request } = await supabaseAdmin
      .from("requests")
      .select("id, service_id, city_id, mode, target_professional_id")
      .eq("id", data.requestId)
      .maybeSingle();
    if (!request) return { notified: 0 };


    let proIds: string[] = [];
    if (request.target_professional_id) {
      proIds = [request.target_professional_id];
    } else {
      const { data: pros } = await supabaseAdmin
        .from("professionals")
        .select("id, user_id, city_id, professional_services(service_id)")
        .eq("status", "active");
      proIds = (pros ?? [])
        .filter((p) => {
          if (!p.user_id) return false;
          const services = (p.professional_services ?? []).map((s) => s.service_id);
          if (request.service_id && services.length > 0 && !services.includes(request.service_id))
            return false;
          if (request.mode !== "online" && request.city_id && p.city_id !== request.city_id)
            return false;
          return true;
        })
        .map((p) => p.id);
    }
    if (proIds.length === 0) return { notified: 0 };

    const { data: targets } = await supabaseAdmin
      .from("professionals")
      .select("id, user_id")
      .in("id", proIds);

    const rows = (targets ?? [])
      .filter((t) => Boolean(t.user_id))
      .map((t) => ({
        user_id: t.user_id as string,
        type: request.target_professional_id ? "request_targeted" : "request_match",
        title: request.target_professional_id
          ? "Nouvelle demande directe"
          : "Nouvelle demande pour vous",
        body: request.target_professional_id
          ? "Un élève vous a envoyé une demande directe."
          : "Un élève recherche un professeur correspondant à votre profil.",
        link,

      }));
    if (rows.length === 0) return { notified: 0 };

    await supabaseAdmin.from("notifications").insert(rows);
    return { notified: rows.length };
  });

/** Notifie l'élève qu'un professeur est intéressé par sa demande. */
export const notifyProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ requestId: z.string().uuid(), professionalId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: request }, { data: pro }] = await Promise.all([
      supabaseAdmin.from("requests").select("id, client_id").eq("id", data.requestId).maybeSingle(),
      supabaseAdmin
        .from("professionals")
        .select("display_name")
        .eq("id", data.professionalId)
        .maybeSingle(),
    ]);
    if (!request?.client_id) return { notified: 0 };

    await supabaseAdmin.from("notifications").insert({
      user_id: request.client_id,
      type: "proposal_received",
      title: "Proposition reçue",
      body: `${pro?.display_name ?? "Un professeur"} est intéressé par votre demande.`,
      link: `/demandes/${request.id}`,
    });
    return { notified: 1 };
  });
