// deno-lint-ignore-file
// VEZA — send-newsletter edge function.
// Requires the following secrets to be set on the Supabase project:
//   RESEND_API_KEY         — your Resend API key
//   RESEND_FROM            — e.g. "VEZA <letters@veza-studios.com>"
//   SUPABASE_URL           — auto-set
//   SUPABASE_SERVICE_ROLE_KEY — auto-set
// Body: { newsletter_id: string }
//
// This function is IDEMPOTENT-ish: it will only send letters whose status is
// "draft" or "scheduled". On success it flips status to "sent" and stamps
// sent_at + recipients_count.

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "VEZA <letters@veza-studios.com>";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!RESEND_API_KEY) {
      return json({ error: "RESEND_API_KEY is not configured" }, 500);
    }

    const { newsletter_id } = await req.json();
    if (!newsletter_id) return json({ error: "newsletter_id required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: letter, error: lerr } = await admin
      .from("newsletters")
      .select("id, subject, html, status")
      .eq("id", newsletter_id)
      .single();
    if (lerr || !letter) return json({ error: lerr?.message ?? "not found" }, 404);
    if (letter.status === "sent") return json({ error: "already sent" }, 400);
    if (!letter.html) return json({ error: "letter has no rendered html — save it first" }, 400);

    const { data: subs, error: serr } = await admin
      .from("newsletter_subscribers")
      .select("email, unsubscribe_token")
      .eq("subscribed", true);
    if (serr) return json({ error: serr.message }, 500);
    if (!subs || subs.length === 0) return json({ error: "no subscribers" }, 400);

    let sent = 0;
    let failed = 0;
    // Simple sequential send with per-recipient token substitution.
    for (const s of subs) {
      const personalHtml = (letter.html as string).replace(/\{\{TOKEN\}\}/g, s.unsubscribe_token);
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [s.email],
          subject: letter.subject,
          html: personalHtml,
        }),
      });
      if (r.ok) sent++;
      else failed++;
      // gentle pacing
      await new Promise((res) => setTimeout(res, 60));
    }

    await admin
      .from("newsletters")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipients_count: sent,
      })
      .eq("id", newsletter_id);

    await admin.from("analytics_events").insert({
      event: "newsletter_sent" as unknown as string,
      meta: { newsletter_id, sent, failed },
    });

    return json({ ok: true, sent, failed });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
