import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({ meta: [{ title: "Unsubscribe — VEZA" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ token: (s.token as string) ?? "" }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) {
        setState("error");
        setMsg("Missing token.");
        return;
      }
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ subscribed: false })
        .eq("unsubscribe_token", token);
      if (error) {
        setState("error");
        setMsg(error.message);
      } else {
        setState("done");
      }
    })();
  }, [token]);

  return (
    <div className="mx-auto max-w-lg px-6 py-32 text-center">
      <p className="label-eyebrow">VEZA — Correspondence</p>
      {state === "loading" && (
        <p className="mt-8 font-serif text-3xl text-charcoal">One moment…</p>
      )}
      {state === "done" && (
        <>
          <h1 className="mt-8 font-serif text-4xl text-charcoal">You've been removed.</h1>
          <p className="mt-4 text-sm font-light leading-relaxed text-charcoal-soft">
            You won't receive our letters anymore. We're sorry to see you go — the atelier remains open should you wish to return.
          </p>
        </>
      )}
      {state === "error" && (
        <>
          <h1 className="mt-8 font-serif text-4xl text-charcoal">Something went wrong.</h1>
          <p className="mt-4 text-sm font-light text-charcoal-soft">{msg}</p>
        </>
      )}
    </div>
  );
}
