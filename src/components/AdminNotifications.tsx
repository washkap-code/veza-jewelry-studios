import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  markAllNotificationsRead,
  markNotificationRead,
  type AdminNotification,
} from "../lib/notifications";

const KIND_LABEL: Record<string, string> = {
  "order.new": "New order",
  "order.status": "Order updated",
  "commission.new": "New commission",
  "newsletter.subscribed": "Newsletter sign-up",
  "journal.create": "Journal — new post",
  "journal.update": "Journal — edited",
  "gallery.upload": "Gallery — new image",
  "product.update": "Product updated",
};

function relTime(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function AdminNotifications() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const { data, isError } = useQuery({
    queryKey: ["admin", "notifications"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as AdminNotification[];
    },
  });

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const markOne = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });
  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  if (isError) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-warm-white text-charcoal/70 transition-colors duration-300 hover:border-teal/60 hover:text-teal"
      >
        <Bell className="h-4 w-4" strokeWidth={1.4} />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal px-1 text-[0.6rem] font-medium text-warm-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] border border-border/60 bg-warm-white shadow-lg">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <p className="label-eyebrow">Activity</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="text-[0.65rem] font-light uppercase tracking-[0.2em] text-charcoal-soft hover:text-teal"
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-[26rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs font-light text-charcoal-soft">
                No activity yet.
              </p>
            ) : (
              <ul className="divide-y divide-border/40">
                {notifications.map((n) => {
                  const inner = (
                    <>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[0.65rem] font-light uppercase tracking-[0.2em] text-teal">
                          {KIND_LABEL[n.kind] ?? n.kind}
                        </p>
                        <span className="text-[0.6rem] font-light uppercase tracking-[0.18em] text-charcoal-soft/70">
                          {relTime(n.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 font-serif text-sm leading-snug text-charcoal">
                        {n.title}
                      </p>
                      {n.message ? (
                        <p className="mt-1 text-xs font-light text-charcoal-soft">{n.message}</p>
                      ) : null}
                    </>
                  );
                  return (
                    <li
                      key={n.id}
                      className={`px-4 py-3 transition-colors ${n.read ? "" : "bg-gold/5"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          {n.link ? (
                            <Link
                              to={n.link}
                              onClick={() => {
                                setOpen(false);
                                if (!n.read) markOne.mutate(n.id);
                              }}
                              className="block hover:opacity-80"
                            >
                              {inner}
                            </Link>
                          ) : (
                            <div>{inner}</div>
                          )}
                        </div>
                        {!n.read ? (
                          <button
                            type="button"
                            aria-label="Mark read"
                            onClick={() => markOne.mutate(n.id)}
                            className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal hover:bg-teal/70"
                          />
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
