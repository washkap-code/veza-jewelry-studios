import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { AuthLoader } from "../components/AuthLoader";
import { AdminEmpty, AdminField, AdminTextArea, AdminToggle, slugify } from "../components/AdminUI";

export const Route = createFileRoute("/admin/journal")({
  component: AdminJournal,
});

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  category: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

type Draft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
};

const EMPTY: Draft = { title: "", slug: "", excerpt: "", content: "", category: "", published: false };

function AdminJournal() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: posts } = useQuery({
    queryKey: ["admin", "journal"],
    queryFn: async () => {
      const { data, error } = await supabase.from("journal_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Post[];
    },
  });

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        title: d.title.trim(),
        slug: d.slug.trim() || slugify(d.title),
        excerpt: d.excerpt.trim() || null,
        content: d.content.trim() || null,
        category: d.category.trim() || null,
        published: d.published,
        published_at: d.published ? new Date().toISOString() : null,
      };
      if (d.id) {
        const { error } = await supabase.from("journal_posts").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("journal_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "journal"] });
      setDraft(null);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.title.trim()) { setError("Title is required."); return; }
    save.mutate(draft);
  }

  if (!posts) return <AuthLoader minHeight="30vh" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-charcoal">Journal</h2>
        <button className="btn-outline-charcoal" onClick={() => { setDraft({ ...EMPTY }); setError(null); }}>
          New post
        </button>
      </div>

      {draft ? (
        <form onSubmit={onSubmit} className="space-y-6 border border-border/60 bg-warm-white p-8">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-charcoal">{draft.id ? "Edit post" : "New post"}</h3>
            <button type="button" className="label-eyebrow text-charcoal-soft hover:text-teal" onClick={() => setDraft(null)}>Close</button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <AdminField label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v, slug: draft.id ? draft.slug : slugify(v) })} required />
            <AdminField label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} />
            <AdminField label="Category" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="Gemstones, Behind the scenes, Travel…" className="md:col-span-2" />
          </div>
          <AdminTextArea label="Excerpt" value={draft.excerpt} onChange={(v) => setDraft({ ...draft, excerpt: v })} rows={2} />
          <AdminTextArea label="Content" value={draft.content} onChange={(v) => setDraft({ ...draft, content: v })} rows={12} />
          <AdminToggle label="Published" checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} />
          {error ? <p className="text-xs font-light text-destructive">{error}</p> : null}
          <button type="submit" disabled={save.isPending} className="btn-outline-charcoal disabled:opacity-60">
            {save.isPending ? "Saving" : "Save post"}
          </button>
        </form>
      ) : null}

      {posts.length === 0 ? (
        <AdminEmpty>No journal posts yet.</AdminEmpty>
      ) : (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {posts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-lg text-charcoal">{p.title}</p>
                <p className="text-xs font-light text-charcoal-soft">{p.category ?? "Uncategorised"} · {p.published ? "published" : "draft"}</p>
              </div>
              <button
                className="label-eyebrow text-charcoal-soft hover:text-teal"
                onClick={() => {
                  setDraft({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt ?? "", content: p.content ?? "", category: p.category ?? "", published: p.published });
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
