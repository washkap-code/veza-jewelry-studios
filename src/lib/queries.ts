import { queryOptions } from "@tanstack/react-query";
import { supabase, type Collection, type Gemstone, type Product } from "./supabase";

export const collectionsQuery = queryOptions({
  queryKey: ["collections"],
  queryFn: async (): Promise<Collection[]> => {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Collection[];
  },
});

export const collectionBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["collection", slug],
    queryFn: async (): Promise<Collection | null> => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return (data as Collection | null) ?? null;
    },
  });

export const productsByCollectionQuery = (collectionId: string | undefined) =>
  queryOptions({
    queryKey: ["products", "collection", collectionId],
    enabled: !!collectionId,
    queryFn: async (): Promise<Product[]> => {
      if (!collectionId) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("collection_id", collectionId)
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

export const productBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return (data as Product | null) ?? null;
    },
  });

export const relatedProductsQuery = (collectionId: string | null, excludeId: string) =>
  queryOptions({
    queryKey: ["products", "related", collectionId, excludeId],
    enabled: !!collectionId,
    queryFn: async (): Promise<Product[]> => {
      if (!collectionId) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("collection_id", collectionId)
        .eq("published", true)
        .neq("id", excludeId)
        .limit(3);
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

export const gemstonesQuery = queryOptions({
  queryKey: ["gemstones"],
  queryFn: async (): Promise<Gemstone[]> => {
    const { data, error } = await supabase
      .from("gemstones")
      .select("*")
      .eq("published", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Gemstone[];
  },
});

export const gemstoneBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["gemstone", slug],
    queryFn: async (): Promise<Gemstone | null> => {
      const { data, error } = await supabase
        .from("gemstones")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return (data as Gemstone | null) ?? null;
    },
  });

export const productsByStoneQuery = (stone: string | null | undefined) =>
  queryOptions({
    queryKey: ["products", "stone", stone],
    enabled: !!stone,
    queryFn: async (): Promise<Product[]> => {
      if (!stone) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("stone", `%${stone}%`)
        .eq("published", true)
        .limit(6);
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

export const featuredProductsQuery = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: async (): Promise<Product[]> => {
    const { data: featured, error: fErr } = await supabase
      .from("products")
      .select("*")
      .eq("published", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (fErr) throw fErr;
    if (featured && featured.length) return featured as Product[];
    // Fallback: latest published products if none are explicitly featured yet.
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) throw error;
    return (data ?? []) as Product[];
  },
});

/** Gemstone slug → soft palette tone for placeholder blocks. */
export const GEMSTONE_TONES: Record<string, string> = {
  aquamarine: "#D6E4E1",
  "tiger-eye": "#D4B07A",
  amethyst: "#B7A6C4",
  quartz: "#EFE9DE",
  mtorolite: "#8BB7A6",
  carnelian: "#D89A7A",
};

export function toneForGemstone(slug: string): string {
  return GEMSTONE_TONES[slug] ?? "#E4E1D9";
}
