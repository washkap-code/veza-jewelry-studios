import { AdminOnly } from "../components/AdminOnly";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase, type Collection, type CollectionStatus } from "../lib/supabase";
import { AuthLoader } from "../components/AuthLoader";
import { AdminEmpty, AdminField, AdminTextArea, AdminToggle, slugify } from "../components/AdminUI";

export const Route = createFileRoute("/admin/collections")({
  component: AdminCollections,
});

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  story: string;
  teaser: string;
  sort_order: string;
  status: CollectionStatus;
  launch_at: string; // datetime-local string, or ""
  published: boolean;
};

const EMPTY: Draft = {
  name: "", slug: "", description: "", story: "", teaser: "",
  sort_order: "0", status: "draft", launch_at: "", published: true,
};

function AdminCollections() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: rows } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Collection[];
    },
  });

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        name: d.name.trim(),
        slug: d.slug.trim() || slugify(d.name),
        description: d.description.trim() || null,
        story: d.story.trim() || null,
        teaser: d.teaser.trim() || null,
        sort_order: Number(d.sort_order) || 0,
        status: d.status,
        launch_at: d.launch_at ? new Date(d.launch_at).toISOString() : null,
        published: d.published,
      };
      if (d.id) {
        const { error } = await supabase.from("collections").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("collections").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "collections"] });
      qc.invalidateQueries({ queryKey: ["collections"] });
      setDraft(null);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim()) { setError("Name is required."); return; }
    if (draft.status === "coming_soon" && draft.launch_at) {
      const t = new Date(draft.launch_at).getTime();
      if (isNaN(t)) { setError("Please enter a valid launch date."); return; }
    }
    save.mutate(draft);
  }

  if (!rows) return <AuthLoader minHeight="30vh" />;

  const statusLabel = (s: CollectionStatus) =>
    s === "live" ? "Live" : s === "coming_soon" ? "Coming soon" : "Draft";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-charcoal">Collections</h2>
        <button className="btn-outline-charcoal" onClick={() => { setDraft({ ...EMPTY }); setError(null); }}>
          New collection
        </button>
      </div>
      <p className="text-xs font-light leading-relaxed text-charcoal-soft">
        Two fashion weeks? Create a second collection (e.g. <em>Fashion Week — Paris</em>) —
        each gets its own countdown page and launch date.
      </p>

      {draft ? (
        <form onSubmit={onSubmit} className="space-y-6 border border-border/60 bg-warm-white p-8">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-charcoal">{draft.id ? "Edit collection" : "New collection"}</h3>
            <button type="button" className="label-eyebrow text-charcoal-soft hover:text-teal" onClick={() => setDraft(null)}>Close</button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <AdminField label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v, slug: draft.id ? draft.slug : slugify(v) })} required />
            <AdminField label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} />
            <AdminField label="Sort order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} />
            <label className="block">
              <span className="label-eyebrow">Status</span>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as CollectionStatus })}
                className="mt-2 block w-full border-b border-border bg-transparent py-2.5 text-sm font-light text-charcoal outline-none focus:border-teal"
              >
                <option value="draft">Draft (fully hidden)</option>
                <option value="coming_soon">Coming soon</option>
                <option value="live">Live</option>
              </select>
            </label>
            <AdminField
              label="Launch date & time (optional — required for countdown)"
              type="datetime-local"
              value={draft.launch_at}
              onChange={(v) => setDraft({ ...draft, launch_at: v })}
            />
          </div>
          <AdminField
            label="Teaser (short line for coming-soon card)"
            value={draft.teaser}
            onChange={(v) => setDraft({ ...draft, teaser: v })}
            placeholder="A runway-season release. Launch dates announced soon."
          />
          <AdminTextArea label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} />
          <AdminTextArea label="Story" value={draft.story} onChange={(v) => setDraft({ ...draft, story: v })} rows={4} />
          <AdminToggle label="Published" checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} />
          {error ? <p className="text-xs font-light text-destructive">{error}</p> : null}
          <button type="submit" disabled={save.isPending} className="btn-outline-charcoal disabled:opacity-60">
            {save.isPending ? "Saving" : "Save collection"}
          </button>
        </form>
      ) : null}

      {rows.length === 0 ? (
        <AdminEmpty>No collections yet.</AdminEmpty>
      ) : (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {rows.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-lg text-charcoal">{c.name}</p>
                <p className="text-xs font-light text-charcoal-soft">
                  order {c.sort_order} · {statusLabel(c.status)}
                  {c.launch_at ? ` · launches ${new Date(c.launch_at).toLocaleString()}` : ""}
                  {c.published ? "" : " · unpublished"}
                </p>
              </div>
              <button
                className="label-eyebrow text-charcoal-soft hover:text-teal"
                onClick={() => {
                  setDraft({
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    description: c.description ?? "",
                    story: c.story ?? "",
                    teaser: c.teaser ?? "",
                    sort_order: String(c.sort_order),
                    status: c.status,
                    launch_at: c.launch_at ? toLocalInput(c.launch_at) : "",
                    published: c.published,
                  });
                  setError(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
