import { AdminOnly } from "../components/AdminOnly";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, type AdminCalendarEvent, type Newsletter, type Collection, type NewsletterSettings } from "../lib/supabase";
import { AdminEmpty } from "../components/AdminUI";

export const Route = createFileRoute("/admin/calendar")({
  head: () => ({ meta: [{ title: "Calendar — VEZA Admin" }] }),
  component: () => (<AdminOnly><CalendarAdmin /></AdminOnly>),
});

function CalendarAdmin() {
  const now = new Date();
  const [ym, setYm] = useState<{ y: number; m: number }>({ y: now.getFullYear(), m: now.getMonth() });

  const { data: events } = useQuery({
    queryKey: ["admin", "calendar-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_calendar_events").select("*").order("event_date");
      if (error) throw error;
      return (data ?? []) as AdminCalendarEvent[];
    },
  });
  const { data: newsletters } = useQuery({
    queryKey: ["admin", "newsletters-cal"],
    queryFn: async () => {
      const { data, error } = await supabase.from("newsletters").select("id, subject, status, scheduled_for, sent_at, updated_at").order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Partial<Newsletter>[];
    },
  });
  const { data: launches } = useQuery({
    queryKey: ["admin", "cal-launches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("id, name, slug, launch_at, status").not("launch_at", "is", null);
      if (error) throw error;
      return (data ?? []) as Partial<Collection>[];
    },
  });
  const { data: settings } = useQuery({
    queryKey: ["admin", "newsletter-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("newsletter_settings").select("*").maybeSingle();
      if (error) throw error;
      return data as NewsletterSettings | null;
    },
  });

  const monthCells = useMemo(() => buildMonth(ym.y, ym.m), [ym]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Array<{ label: string; kind: string }>>();
    const push = (date: string, label: string, kind: string) => {
      const k = date.slice(0, 10);
      const arr = map.get(k) ?? [];
      arr.push({ label, kind });
      map.set(k, arr);
    };
    (events ?? []).forEach((e) => push(e.event_date, e.title, e.kind));
    (newsletters ?? []).forEach((n) => {
      if (n.sent_at) push(n.sent_at, `Letter sent · ${n.subject ?? ""}`, "newsletter_sent");
      else if (n.scheduled_for) push(n.scheduled_for, `Scheduled · ${n.subject ?? ""}`, "scheduled");
      else if (n.status === "draft" && n.updated_at) push(n.updated_at, `Draft · ${n.subject ?? ""}`, "draft");
    });
    (launches ?? []).forEach((c) => {
      if (c.launch_at) push(c.launch_at, `Launch · ${c.name}`, "launch");
    });
    // Monthly reminder based on preferred send day
    const day = settings?.preferred_send_day ?? 1;
    const reminder = new Date(ym.y, ym.m, Math.min(day, 28));
    push(reminder.toISOString(), "Monthly letter due", "newsletter_reminder");
    return map;
  }, [events, newsletters, launches, settings, ym]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="text-xs font-light uppercase tracking-[0.22em] text-charcoal-soft hover:text-teal"
            onClick={() =>
              setYm((s) => (s.m === 0 ? { y: s.y - 1, m: 11 } : { y: s.y, m: s.m - 1 }))
            }
          >
            ← Prev
          </button>
          <h2 className="font-serif text-2xl text-charcoal">
            {new Date(ym.y, ym.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h2>
          <button
            className="text-xs font-light uppercase tracking-[0.22em] text-charcoal-soft hover:text-teal"
            onClick={() =>
              setYm((s) => (s.m === 11 ? { y: s.y + 1, m: 0 } : { y: s.y, m: s.m + 1 }))
            }
          >
            Next →
          </button>
        </div>
        <SendDayControl settings={settings ?? null} />
      </div>

      <div className="mt-6 grid grid-cols-7 border-l border-t border-border/60 text-sm">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="border-b border-r border-border/60 bg-warm-white px-2 py-1 text-[0.6rem] font-light uppercase tracking-[0.2em] text-charcoal-soft"
          >
            {d}
          </div>
        ))}
        {monthCells.map((cell, i) => {
          const dateKey = cell.date.toISOString().slice(0, 10);
          const items = eventsByDate.get(dateKey) ?? [];
          const isToday = dateKey === new Date().toISOString().slice(0, 10);
          return (
            <div
              key={i}
              className={`min-h-[92px] border-b border-r border-border/60 p-2 ${cell.inMonth ? "bg-white" : "bg-warm-white/40 text-charcoal-soft/60"}`}
            >
              <div className={`text-[0.7rem] ${isToday ? "font-semibold text-teal" : "font-light text-charcoal-soft"}`}>
                {cell.date.getDate()}
              </div>
              <ul className="mt-1 space-y-1">
                {items.slice(0, 3).map((it, j) => (
                  <li
                    key={j}
                    className={`truncate rounded-sm px-1.5 py-0.5 text-[0.65rem] font-light ${kindClass(it.kind)}`}
                    title={it.label}
                  >
                    {it.label}
                  </li>
                ))}
                {items.length > 3 && (
                  <li className="text-[0.6rem] font-light text-charcoal-soft">+{items.length - 3} more</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {(events ?? []).length === 0 && (newsletters ?? []).length === 0 && (launches ?? []).length === 0 && (
        <div className="mt-8"><AdminEmpty>No events yet — drafts, launches and reminders appear here.</AdminEmpty></div>
      )}
    </div>
  );
}

function SendDayControl({ settings }: { settings: NewsletterSettings | null }) {
  const [day, setDay] = useState<number>(settings?.preferred_send_day ?? 1);
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    if (settings) {
      await supabase.from("newsletter_settings").update({ preferred_send_day: day }).eq("id", settings.id);
    } else {
      await supabase.from("newsletter_settings").insert({ preferred_send_day: day });
    }
    setSaving(false);
  }
  return (
    <div className="flex items-center gap-3">
      <label className="text-[0.7rem] font-light uppercase tracking-[0.22em] text-charcoal-soft">
        Preferred send day
      </label>
      <select
        value={day}
        onChange={(e) => setDay(Number(e.target.value))}
        className="border-b border-border bg-transparent py-1 text-sm text-charcoal focus:border-teal"
      >
        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <button onClick={save} disabled={saving} className="text-[0.7rem] font-light uppercase tracking-[0.22em] text-teal">
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

function kindClass(kind: string): string {
  switch (kind) {
    case "launch":
      return "bg-gold/15 text-charcoal";
    case "newsletter_sent":
      return "bg-teal/15 text-teal";
    case "scheduled":
      return "bg-teal/10 text-teal";
    case "draft":
      return "bg-border/50 text-charcoal-soft";
    case "newsletter_reminder":
      return "bg-charcoal/10 text-charcoal";
    default:
      return "bg-warm-white text-charcoal-soft";
  }
}

function buildMonth(year: number, month: number): { date: Date; inMonth: boolean }[] {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7; // Monday=0
  const start = new Date(year, month, 1 - startDow);
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}
