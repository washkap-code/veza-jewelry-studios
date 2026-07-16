import { supabase } from "./supabase";

const SESSION_KEY = "veza_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export type AnalyticsEvent =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_start"
  | "order_created"
  | "commission_submitted";

export async function logEvent(
  event: AnalyticsEvent,
  data: {
    path?: string;
    referrer?: string;
    product_id?: string;
    meta?: Record<string, unknown>;
  } = {},
) {
  if (typeof window === "undefined") return;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("analytics_events").insert({
      event,
      path: data.path ?? window.location.pathname,
      referrer: data.referrer ?? document.referrer ?? null,
      session_id: getSessionId(),
      user_id: user?.id ?? null,
      product_id: data.product_id ?? null,
      meta: data.meta ?? {},
    });
  } catch {
    /* analytics must never break the app */
  }
}
