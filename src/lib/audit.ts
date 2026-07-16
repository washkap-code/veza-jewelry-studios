import { supabase } from "./supabase";

/**
 * Best-effort audit log insert. Errors are swallowed and logged so that a
 * failing audit write never blocks the user's action.
 *
 * The DB policy requires actor_id === auth.uid() AND the caller to be
 * admin or staff. Anonymous callers are silently ignored.
 */
export async function logAudit(input: {
  action: string;
  entity?: string | null;
  entity_id?: string | null;
  meta?: Record<string, unknown> | null;
  actor_role: "admin" | "staff";
  actor_email?: string | null;
}): Promise<void> {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return;
    await supabase.from("audit_log").insert({
      actor_id: user.id,
      actor_email: input.actor_email ?? user.email ?? null,
      actor_role: input.actor_role,
      action: input.action,
      entity: input.entity ?? null,
      entity_id: input.entity_id ?? null,
      meta: input.meta ?? null,
    });
  } catch (err) {
    // Audit is best-effort — don't disturb the primary flow.
    // eslint-disable-next-line no-console
    console.warn("[audit] insert failed", err);
  }
}

export type AuditRow = {
  id: string;
  actor_id: string;
  actor_email: string | null;
  actor_role: "admin" | "staff";
  action: string;
  entity: string | null;
  entity_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};
