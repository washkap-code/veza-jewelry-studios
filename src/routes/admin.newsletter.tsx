import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase, type Newsletter, type NewsletterBlock } from "../lib/supabase";
import { proseToBlocks, renderNewsletterHtml } from "../lib/newsletter";
import { draftNewsletter } from "../lib/newsletter-ai.functions";
import { AdminEmpty, AdminField, AdminTextArea, StatusBadge } from "../components/AdminUI";
import { logEvent } from "../lib/analytics";

export const Route = createFileRoute("/admin/newsletter")({
  head: () => ({ meta: [{ title: "Newsletter — VEZA Admin" }] }),
  component: NewsletterAdmin,
});

type GalleryRow = { id: string; url: string; alt: string | null };

function NewsletterAdmin() {
  const qc = useQueryClient();
  const draft = useServerFn(draftNewsletter);

  const { data: letters } = useQuery({
    queryKey: ["admin", "newsletters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletters")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Newsletter[];
    },
  });

  const { data: subscribers } = useQuery({
    queryKey: ["admin", "subscribers"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("subscribed", true);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = letters?.find((l) => l.id === selectedId) ?? null;

  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [blocks, setBlocks] = useState<NewsletterBlock[]>([]);
  const [notes, setNotes] = useState("");
  const [angle, setAngle] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setSubject(selected.subject ?? "");
    setPreheader(selected.preheader ?? "");
    setBlocks(Array.isArray(selected.blocks) ? selected.blocks : []);
  }, [selected]);

  const html = useMemo(
    () =>
      renderNewsletterHtml({
        subject: subject || "VEZA — Letter",
        preheader,
        blocks,
        siteUrl: typeof window !== "undefined" ? window.location.origin : undefined,
      }),
    [subject, preheader, blocks],
  );

  const createLetter = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("newsletters")
        .insert({ subject: "Untitled letter", blocks: [], status: "draft" })
        .select()
        .single();
      if (error) throw error;
      return data as Newsletter;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["admin", "newsletters"] });
      setSelectedId(row.id);
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!selected) return;
      const { error } = await supabase
        .from("newsletters")
        .update({ subject, preheader, blocks, html })
        .eq("id", selected.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "newsletters"] });
      setFlash("Saved.");
      setTimeout(() => setFlash(null), 2000);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("newsletters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "newsletters"] });
      if (selectedId) setSelectedId(null);
    },
  });

  async function runDraft() {
    if (!notes.trim()) return;
    setDrafting(true);
    try {
      const { markdown } = await draft({ data: { notes, angle: angle || undefined } });
      const derived = proseToBlocks(markdown);
      // Derive subject from first heading if empty
      const heading = derived.find((b) => b.type === "heading");
      if (!subject && heading && heading.type === "heading") setSubject(heading.text);
      setBlocks((prev) => [...derived, ...(prev.length ? [{ type: "divider" as const }, ...prev] : [])]);
      setNotes("");
    } catch (e) {
      setFlash(e instanceof Error ? e.message : "AI failed.");
    } finally {
      setDrafting(false);
    }
  }

  async function insertGalleryImage(row: GalleryRow) {
    setBlocks((b) => [...b, { type: "image", url: row.url, alt: row.alt ?? "" }]);
    setPickerOpen(false);
  }

  async function markExported() {
    if (!selected) return;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(subject || "veza-letter").replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    await supabase.from("newsletters").update({ status: "exported", html }).eq("id", selected.id);
    qc.invalidateQueries({ queryKey: ["admin", "newsletters"] });
  }

  async function exportSubscribersCsv() {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("email, full_name, subscribed, created_at")
      .eq("subscribed", true)
      .order("created_at", { ascending: true });
    if (error) {
      setFlash(error.message);
      return;
    }
    const rows = data ?? [];
    const csv = [
      "email,full_name,subscribed_at",
      ...rows.map(
        (r) =>
          `${(r.email ?? "").replace(/,/g, "")},${(r.full_name ?? "").replace(/,/g, " ")},${r.created_at ?? ""}`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `veza-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  async function sendNow() {
    if (!selected) return;
    // No live email backend yet — record a "sent" outcome only if user confirms
    setFlash("Email sending isn't configured yet. Use Export HTML + Subscribers CSV for now.");
    setTimeout(() => setFlash(null), 5000);
    await logEvent("page_view", { meta: { attempted_newsletter_send: selected.id } });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-4">
        <button className="btn-outline-charcoal w-full" onClick={() => createLetter.mutate()}>
          New letter
        </button>
        <div className="border border-border/60 bg-warm-white p-4">
          <p className="label-eyebrow">Private list</p>
          <p className="mt-2 font-serif text-3xl text-charcoal">{subscribers ?? "—"}</p>
          <p className="mt-1 text-xs font-light text-charcoal-soft">active subscribers</p>
          <button
            onClick={exportSubscribersCsv}
            className="mt-3 text-[0.7rem] font-light uppercase tracking-[0.22em] text-teal"
          >
            Export CSV
          </button>
        </div>
        <div className="border border-border/60">
          {(letters ?? []).length === 0 ? (
            <AdminEmpty>No letters yet.</AdminEmpty>
          ) : (
            <ul className="divide-y divide-border/60">
              {(letters ?? []).map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => setSelectedId(l.id)}
                    className={`flex w-full items-start gap-3 p-3 text-left transition-colors ${selectedId === l.id ? "bg-teal/5" : "hover:bg-warm-white"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-light text-charcoal">
                        {l.subject || "Untitled letter"}
                      </p>
                      <p className="mt-1 text-[0.65rem] font-light uppercase tracking-[0.18em] text-charcoal-soft">
                        {new Date(l.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={l.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Editor */}
      <div>
        {!selected ? (
          <AdminEmpty>Select or create a letter to begin.</AdminEmpty>
        ) : (
          <div className="space-y-8">
            <div className="border border-border/60 bg-warm-white p-6">
              <p className="label-eyebrow">Draft with AI</p>
              <p className="mt-2 text-sm font-light text-charcoal-soft">
                Paste rough notes — pieces, stories, mood, links. VEZA voice, editorial, no marketing tone.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
                <AdminTextArea label="Rough notes" value={notes} onChange={setNotes} rows={5} />
                <AdminField label="Editorial angle (optional)" value={angle} onChange={setAngle} placeholder="e.g. the return of citrine" />
              </div>
              <button
                onClick={runDraft}
                disabled={drafting || !notes.trim()}
                className="btn-primary mt-4 disabled:opacity-50"
              >
                {drafting ? "Drafting…" : "Draft with AI"}
              </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4">
                <AdminField label="Subject line" value={subject} onChange={setSubject} />
                <AdminField label="Preheader" value={preheader} onChange={setPreheader} placeholder="One line preview shown in the inbox" />

                <div className="border border-border/60 bg-warm-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="label-eyebrow">Blocks</p>
                    <div className="flex gap-2 text-[0.7rem] font-light uppercase tracking-[0.22em]">
                      <button className="text-teal" onClick={() => setBlocks((b) => [...b, { type: "heading", text: "New heading" }])}>+ Heading</button>
                      <button className="text-teal" onClick={() => setBlocks((b) => [...b, { type: "paragraph", text: "" }])}>+ Text</button>
                      <button className="text-teal" onClick={() => setPickerOpen(true)}>+ Image</button>
                      <button className="text-teal" onClick={() => setBlocks((b) => [...b, { type: "divider" }])}>+ Rule</button>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {blocks.map((b, i) => (
                      <li key={i} className="border border-border/40 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[0.65rem] font-light uppercase tracking-[0.2em] text-charcoal-soft">
                            {b.type}
                          </span>
                          <div className="flex gap-2 text-[0.65rem] font-light uppercase tracking-[0.2em]">
                            <button onClick={() => setBlocks((arr) => swap(arr, i, i - 1))} disabled={i === 0}>↑</button>
                            <button onClick={() => setBlocks((arr) => swap(arr, i, i + 1))} disabled={i === blocks.length - 1}>↓</button>
                            <button className="text-destructive" onClick={() => setBlocks((arr) => arr.filter((_, j) => j !== i))}>Remove</button>
                          </div>
                        </div>
                        {b.type === "heading" && (
                          <input
                            className="mt-2 block w-full border-b border-border bg-transparent py-1.5 text-sm text-charcoal outline-none focus:border-teal"
                            value={b.text}
                            onChange={(e) => updateBlock(setBlocks, i, { ...b, text: e.target.value })}
                          />
                        )}
                        {b.type === "paragraph" && (
                          <textarea
                            rows={4}
                            className="mt-2 block w-full border border-border/60 bg-transparent p-2 text-sm text-charcoal outline-none focus:border-teal"
                            value={b.text}
                            onChange={(e) => updateBlock(setBlocks, i, { ...b, text: e.target.value })}
                          />
                        )}
                        {b.type === "image" && (
                          <div className="mt-2 flex items-start gap-3">
                            <img src={b.url} alt={b.alt ?? ""} className="h-20 w-20 object-cover" />
                            <input
                              className="block w-full border-b border-border bg-transparent py-1.5 text-sm text-charcoal outline-none focus:border-teal"
                              placeholder="Alt text / caption"
                              value={b.alt ?? ""}
                              onChange={(e) => updateBlock(setBlocks, i, { ...b, alt: e.target.value })}
                            />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => save.mutate()} className="btn-primary">
                    Save draft
                  </button>
                  <button onClick={markExported} className="btn-outline-charcoal">
                    Export HTML
                  </button>
                  <button
                    onClick={sendNow}
                    className="text-[0.7rem] font-light uppercase tracking-[0.22em] text-charcoal-soft hover:text-teal"
                    title="Email sending will use Resend once configured"
                  >
                    Send… (not configured)
                  </button>
                  <button
                    onClick={() => del.mutate(selected.id)}
                    className="text-[0.7rem] font-light uppercase tracking-[0.22em] text-destructive"
                  >
                    Delete
                  </button>
                  {flash && <span className="text-xs font-light text-teal">{flash}</span>}
                </div>
              </div>

              {/* Live preview */}
              <div className="border border-border/60 bg-white">
                <div className="border-b border-border/60 px-4 py-2 text-[0.65rem] font-light uppercase tracking-[0.22em] text-charcoal-soft">
                  Live preview
                </div>
                <iframe
                  title="Newsletter preview"
                  srcDoc={html}
                  className="h-[900px] w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {pickerOpen && <GalleryPicker onPick={insertGalleryImage} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}

function GalleryPicker({ onPick, onClose }: { onPick: (r: GalleryRow) => void; onClose: () => void }) {
  const { data } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, url, alt")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as GalleryRow[];
    },
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-6" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-4xl overflow-auto border border-border bg-warm-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="label-eyebrow">Gallery</p>
          <button onClick={onClose} className="text-xs uppercase tracking-[0.22em] text-charcoal-soft">
            Close
          </button>
        </div>
        {!data || data.length === 0 ? (
          <AdminEmpty>Upload images from Admin → Gallery first.</AdminEmpty>
        ) : (
          <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
            {data.map((r) => (
              <button key={r.id} onClick={() => onPick(r)} className="group block overflow-hidden border border-border/60 bg-white">
                <img src={r.url} alt={r.alt ?? ""} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="truncate p-2 text-[0.65rem] font-light uppercase tracking-[0.18em] text-charcoal-soft">
                  {r.alt || "—"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function swap<T>(arr: T[], a: number, b: number): T[] {
  if (b < 0 || b >= arr.length) return arr;
  const copy = arr.slice();
  [copy[a], copy[b]] = [copy[b], copy[a]];
  return copy;
}
function updateBlock(
  setBlocks: React.Dispatch<React.SetStateAction<NewsletterBlock[]>>,
  i: number,
  next: NewsletterBlock,
) {
  setBlocks((arr) => arr.map((b, j) => (j === i ? next : b)));
}
