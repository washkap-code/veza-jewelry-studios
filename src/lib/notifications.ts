import { supabase } from "./supabase";

export type NotificationKind =
  | "order.new"
  | "order.status"
  | "commission.new"
  | "newsletter.subscribed"
  | "journal.create"
  | "journal.update"
  | "gallery.upload"
  | "product.update";

export type AdminNotification = {
  id: string;
  kind: NotificationKind | string;
  title: string;
  message: string | null;
  link: string | null;
  meta: Record<string, unknown> | null;
  read: boolean;
  read_at: string | null;
  read_by: string | null;
  created_at: string;
};

/**
 * Insert an admin notification. Best-effort — never blocks the primary flow.
 * Any authenticated OR anonymous user may insert; only admins/staff can read.
 */
export async function notifyAdmins(input: {
  kind: NotificationKind | string;
  title: string;
  message?: string | null;
  link?: string | null;
  meta?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    await supabase.from("admin_notifications").insert({
      kind: input.kind,
      title: input.title,
      message: input.message ?? null,
      link: input.link ?? null,
      meta: input.meta ?? null,
      read: false,
    });
  } catch (err) {
    // Never disturb the user flow if the notification write fails.

    console.warn("[notify] insert failed", err);
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  const { data: userRes } = await supabase.auth.getUser();
  await supabase
    .from("admin_notifications")
    .update({ read: true, read_at: new Date().toISOString(), read_by: userRes.user?.id ?? null })
    .eq("id", id);
}

export async function markAllNotificationsRead(): Promise<void> {
  const { data: userRes } = await supabase.auth.getUser();
  await supabase
    .from("admin_notifications")
    .update({ read: true, read_at: new Date().toISOString(), read_by: userRes.user?.id ?? null })
    .eq("read", false);
}
