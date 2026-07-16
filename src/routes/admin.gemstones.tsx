import { AdminOnly } from "../components/AdminOnly";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase, type Gemstone } from "../lib/supabase";
import { AuthLoader } from "../components/AuthLoader";
import { AdminEmpty, AdminField, AdminTextArea, AdminToggle, slugify } from "../components/AdminUI";

export const Route = createFileRoute("/admin/gemstones")({
  component: () => (<AdminOnly><AdminGemstones /></AdminOnly>),
});

type Draft = {
  id?: string;
  name: string;
  slug: string;
  origin: string;
  hardness: string;
  symbolism: string;
  description: string;
  color_variations: string;
  care_guide: string;
  zimbabwe_sourcing: string;
  published: boolean;
};

const EMPTY: Draft = {
  name: "", slug: "", origin: "", hardness: "", symbolism: "", description: "",
  color_variations: "", care_guide: "", zimbabwe_sourcing: "", published: false,
};

function AdminGemstones() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: rows } = useQuery({
    queryKey: ["admin", "gemstones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gemstones").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as Gemstone[];
    },
  });

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        name: d.name.trim(),
        slug: d.slug.trim() || slugify(d.name),
        origin: d.origin.trim() || null,
        hardness: d.hardness.trim() || null,
        symbolism: d.symbolism.trim() || null,
        description: d.description.trim() || null,
        color_variations: d.color_variations.trim() || null,
        care_guide: d.care_guide.trim() || null,
        zimbabwe_sourcing: d.zimbabwe_sourcing.trim() || null,
        published: d.published,
      };
      if (d.id) {
        const { error } = await supabase.from("gemstones").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gemstones").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "gemstones"] });
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
        <h2 className="font-serif text-2xl text-charcoal">Gemstones</h2>
        <button className="btn-outline-charcoal" onClick={() => { setDraft({ ...EMPTY }); setError(null); }}>
          New gemstone
        </button>
      </div>

      {draft ? (
        <form onSubmit={onSubmit} className="space-y-6 border border-border/60 bg-warm-white p-8">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-charcoal">{draft.id ? "Edit gemstone" : "New gemstone"}</h3>
            <button type="button" className="label-eyebrow text-charcoal-soft hover:text-teal" onClick={() => setDraft(null)}>Close</button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <AdminField label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v, slug: draft.id ? draft.slug : slugify(v) })} required />
            <AdminField label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} />
            <AdminField label="Origin" value={draft.origin} onChange={(v) => setDraft({ ...draft, origin: v })} />
            <AdminField label="Hardness (Mohs)" value={draft.hardness} onChange={(v) => setDraft({ ...draft, hardness: v })} />
            <AdminField label="Colour variations" value={draft.color_variations} onChange={(v) => setDraft({ ...draft, color_variations: v })} className="md:col-span-2" />
          </div>
          <AdminTextArea label="Symbolism" value={draft.symbolism} onChange={(v) => setDraft({ ...draft, symbolism: v })} rows={2} />
          <AdminTextArea label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={3} />
          <AdminTextArea label="Zimbabwean sourcing" value={draft.zimbabwe_sourcing} onChange={(v) => setDraft({ ...draft, zimbabwe_sourcing: v })} rows={2} />
          <AdminTextArea label="Care guide" value={draft.care_guide} onChange={(v) => setDraft({ ...draft, care_guide: v })} rows={2} />
          <AdminToggle label="Published" checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} />
          {error ? <p className="text-xs font-light text-destructive">{error}</p> : null}
          <button type="submit" disabled={save.isPending} className="btn-outline-charcoal disabled:opacity-60">
            {save.isPending ? "Saving" : "Save gemstone"}
          </button>
        </form>
      ) : null}

      {rows.length === 0 ? (
        <AdminEmpty>No gemstones yet.</AdminEmpty>
      ) : (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {rows.map((g) => (
            <li key={g.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-lg text-charcoal">{g.name}</p>
                <p className="text-xs font-light text-charcoal-soft">{g.origin ?? "—"} · {g.published ? "published" : "draft"}</p>
              </div>
              <button
                className="label-eyebrow text-charcoal-soft hover:text-teal"
                onClick={() => {
                  setDraft({
                    id: g.id, name: g.name, slug: g.slug, origin: g.origin ?? "", hardness: g.hardness ?? "",
                    symbolism: g.symbolism ?? "", description: g.description ?? "", color_variations: g.color_variations ?? "",
                    care_guide: g.care_guide ?? "", zimbabwe_sourcing: g.zimbabwe_sourcing ?? "", published: g.published,
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
