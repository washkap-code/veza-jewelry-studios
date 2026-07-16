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
        sort_order: Number(d.sort_order) || 0,
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
      setDraft(null);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim()) { setError("Name is required."); return; }
    save.mutate(draft);
  }

  if (!rows) return <AuthLoader minHeight="30vh" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-charcoal">Collections</h2>
        <button className="btn-outline-charcoal" onClick={() => { setDraft({ ...EMPTY }); setError(null); }}>
          New collection
        </button>
      </div>

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
          </div>
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
                <p className="text-xs font-light text-charcoal-soft">order {c.sort_order} · {c.published ? "published" : "draft"}</p>
              </div>
              <button
                className="label-eyebrow text-charcoal-soft hover:text-teal"
                onClick={() => {
                  setDraft({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? "", story: c.story ?? "", sort_order: String(c.sort_order), published: c.published });
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
