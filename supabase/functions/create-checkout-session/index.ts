// Supabase Edge Function: create-checkout-session
// Dormant by default. Returns a clear "payments not yet enabled" error until
// (a) payment_settings.payments_enabled = true AND (b) STRIPE_SECRET_KEY is set.
//
// Deploy: `supabase functions deploy create-checkout-session --no-verify-jwt`
// Secrets: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Item {
  name: string;
  unit_amount: number; // in minor units (cents)
  quantity: number;
  currency?: string;
}

interface Body {
  items: Item[];
  order_id?: string;
  success_url: string;
  cancel_url: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supaUrl = Deno.env.get("SUPABASE_URL");
  const supaKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supaUrl || !supaKey) {
    return json({ error: "Server misconfigured" }, 500);
  }

  const supa = createClient(supaUrl, supaKey, {
    auth: { persistSession: false },
  });

  const { data: settings } = await supa
    .from("payment_settings")
    .select("payments_enabled, currency")
    .eq("id", 1)
    .maybeSingle();

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!settings?.payments_enabled || !stripeKey) {
    return json(
      {
        error: "payments_not_enabled",
        message:
          "Card payments are not yet enabled for this studio. Your order request will continue to be handled personally by the atelier.",
      },
      503,
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!body.items?.length || !body.success_url || !body.cancel_url) {
    return json({ error: "Missing items or return URLs" }, 400);
  }

  // Build Stripe Checkout session via REST (avoids SDK bundling).
  const form = new URLSearchParams();
  form.append("mode", "payment");
  form.append("success_url", body.success_url);
  form.append("cancel_url", body.cancel_url);
  if (body.order_id) form.append("client_reference_id", body.order_id);
  body.items.forEach((it, i) => {
    form.append(
      `line_items[${i}][price_data][currency]`,
      (it.currency ?? settings.currency ?? "USD").toLowerCase(),
    );
    form.append(`line_items[${i}][price_data][product_data][name]`, it.name);
    form.append(
      `line_items[${i}][price_data][unit_amount]`,
      String(it.unit_amount),
    );
    form.append(`line_items[${i}][quantity]`, String(it.quantity));
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const data: any = await res.json();
  if (!res.ok) {
    return json(
      { error: "stripe_error", message: data?.error?.message ?? "Unknown Stripe error" },
      502,
    );
  }
  return json({ id: data.id, url: data.url });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
