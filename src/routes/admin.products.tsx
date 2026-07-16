import { AdminOnly } from "../components/AdminOnly";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase, type Collection, type Product, type ProductImage } from "../lib/supabase";
import { AuthLoader } from "../components/AuthLoader";
import {
  AdminEmpty, AdminField, AdminSelect, AdminTextArea, AdminToggle, slugify,
} from "../components/AdminUI";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type Draft = {
  id?: string;
  name: string;
  slug: string;
  collection_id: string;
  description: string;
  price: string;
  currency: string;
  stone: string;
  materials: string;
  dimensions: string;
  weight: string;
  care_instructions: string;
  stock_quantity: string;
  published: boolean;
  featured: boolean;
  images: ProductImage[];
};

const EMPTY: Draft = {
  name: "", slug: "", collection_id: "", description: "", price: "", currency: "USD",
  stone: "", materials: "", dimensions: "", weight: "", care_instructions: "",
  stock_quantity: "0", published: false, featured: false, images: [],
};

function toDraft(p: Product): Draft {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    collection_id: p.collection_id ?? "",
    description: p.description ?? "",
    price: String(p.price),
    currency: p.currency,
    stone: p.stone ?? "",
    materials: p.materials ?? "",
    dimensions: p.dimensions ?? "",
    weight: p.weight ?? "",
    care_instructions: p.care_instructions ?? "",
    stock_quantity: String(p.stock_quantity ?? 0),
    published: p.published,
    featured: p.featured,
    images: p.images ?? [],
  };
}

function AdminProducts() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: products } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const { data: collections } = useQuery({
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
        collection_id: d.collection_id || null,
        description: d.description.trim() || null,
        price: Number(d.price) || 0,
        currency: d.currency || "USD",
        stone: d.stone.trim() || null,
        materials: d.materials.trim() || null,
        dimensions: d.dimensions.trim() || null,
        weight: d.weight.trim() || null,
        care_instructions: d.care_instructions.trim() || null,
        stock_quantity: Number(d.stock_quantity) || 0,
        published: d.published,
        featured: d.featured,
        images: d.images,
      };
      if (d.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      setDraft(null);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async (p: Product) => {
      const { error } = await supabase.from("products").update({ published: !p.published }).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  async function uploadImages(files: FileList) {
    if (!draft) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: ProductImage[] = [];
      for (const file of Array.from(files)) {
        const path = `products/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${file.name.split(".").pop()}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push({ url: data.publicUrl, alt: draft.name });
      }
      setDraft((d) => (d ? { ...d, images: [...d.images, ...uploaded] } : d));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim()) { setError("Name is required."); return; }
    if (draft.published) {
      if (!draft.description.trim()) {
        setError("A product description is required before publishing.");
        return;
      }
      if (draft.images.length < 1) {
        setError("Add at least one photo before publishing.");
        return;
      }
      if (draft.images.length > 6) {
        setError("A product may have at most 6 photos.");
        return;
      }
    }
    save.mutate(draft);
  }

  async function refineDescription() {
    if (!draft?.description.trim()) {
      setError("Add some rough notes first, then Refine.");
      return;
    }
    setError(null);
    try {
      const { refineCopy } = await import("../lib/ai-refine.functions");
      const { refined } = await refineCopy({ data: { kind: "product", raw: draft.description, hint: draft.stone || undefined } });
      if (confirm(`Refined copy:\n\n${refined}\n\nUse it?`)) {
        setDraft((d) => (d ? { ...d, description: refined } : d));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI refine failed.");
    }
  }

  if (!products) return <AuthLoader minHeight="30vh" />;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-charcoal">Products</h2>
        <button className="btn-outline-charcoal" onClick={() => { setDraft({ ...EMPTY }); setError(null); }}>
          New product
        </button>
      </div>

      {draft ? (
        <form onSubmit={onSubmit} className="space-y-6 border border-border/60 bg-warm-white p-8">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-charcoal">{draft.id ? "Edit product" : "New product"}</h3>
            <button type="button" className="label-eyebrow text-charcoal-soft hover:text-teal" onClick={() => setDraft(null)}>
              Close
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <AdminField label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v, slug: draft.id ? draft.slug : slugify(v) })} required />
            <AdminField label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} />
            <AdminSelect
              label="Collection"
              value={draft.collection_id}
              onChange={(v) => setDraft({ ...draft, collection_id: v })}
              options={[{ value: "", label: "— None —" }, ...(collections ?? []).map((c) => ({ value: c.id, label: c.name }))]}
            />
            <AdminField label="Stone" value={draft.stone} onChange={(v) => setDraft({ ...draft, stone: v })} />
            <AdminField label="Price" type="number" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} required />
            <AdminField label="Currency" value={draft.currency} onChange={(v) => setDraft({ ...draft, currency: v })} />
            <AdminField label="Materials" value={draft.materials} onChange={(v) => setDraft({ ...draft, materials: v })} />
            <AdminField label="Dimensions" value={draft.dimensions} onChange={(v) => setDraft({ ...draft, dimensions: v })} />
            <AdminField label="Weight" value={draft.weight} onChange={(v) => setDraft({ ...draft, weight: v })} />
            <AdminField label="Stock quantity" type="number" value={draft.stock_quantity} onChange={(v) => setDraft({ ...draft, stock_quantity: v })} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="label-eyebrow">Description {draft.published ? <span className="text-destructive">*</span> : null}</span>
              <button type="button" onClick={refineDescription} className="text-[0.68rem] font-light uppercase tracking-[0.24em] text-teal hover:underline">
                ✧ Refine with AI
              </button>
            </div>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={5}
              className="mt-3 block w-full border-b border-border bg-transparent py-3 text-sm font-light text-charcoal outline-none focus:border-teal"
            />
          </div>
          <AdminTextArea label="Care instructions" value={draft.care_instructions} onChange={(v) => setDraft({ ...draft, care_instructions: v })} rows={2} />
          <p className="text-xs font-light text-charcoal-soft">
            Products require 1–6 photos and a description before they can be published.
            Current: {draft.images.length}/6 photos.
          </p>

          <div>
            <span className="label-eyebrow">Images</span>
            <div className="mt-3 flex flex-wrap gap-3">
              {draft.images.map((img, i) => (
                <div key={img.url} className="relative h-24 w-20 overflow-hidden bg-muted">
                  <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => setDraft({ ...draft, images: draft.images.filter((_, n) => n !== i) })}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center bg-charcoal/70 text-xs text-ivory"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="flex h-24 w-20 cursor-pointer items-center justify-center border border-dashed border-border text-2xl font-light text-charcoal-soft transition-colors duration-500 hover:border-teal hover:text-teal">
                +
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && uploadImages(e.target.files)}
                />
              </label>
            </div>
            {uploading ? <p className="mt-2 text-xs font-light text-charcoal-soft">Uploading…</p> : null}
          </div>

          <div className="flex flex-wrap items-center gap-8">
            <AdminToggle label="Published" checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} />
            <AdminToggle label="Featured" checked={draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
          </div>

          {error ? <p className="text-xs font-light text-destructive">{error}</p> : null}

          <button type="submit" disabled={save.isPending || uploading} className="btn-outline-charcoal disabled:opacity-60">
            {save.isPending ? "Saving" : "Save product"}
          </button>
        </form>
      ) : null}

      {products.length === 0 ? (
        <AdminEmpty>No products yet — create the first one.</AdminEmpty>
      ) : (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {products.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="h-14 w-12 shrink-0 overflow-hidden bg-muted">
                {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-lg text-charcoal">{p.name}</p>
                <p className="text-xs font-light text-charcoal-soft">
                  {p.currency} {Number(p.price).toFixed(0)} · stock {p.stock_quantity ?? 0}{p.featured ? " · featured" : ""}
                </p>
              </div>
              <AdminToggle label={p.published ? "Published" : "Draft"} checked={p.published} onChange={() => togglePublish.mutate(p)} />
              <button className="label-eyebrow text-charcoal-soft hover:text-teal" onClick={() => { setDraft(toDraft(p)); setError(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
