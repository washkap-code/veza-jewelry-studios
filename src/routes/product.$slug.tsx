import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import {
  productBySlugQuery,
  relatedProductsQuery,
} from "../lib/queries";
import { supabase, type Product } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { useCart, formatPrice } from "../lib/cart";
import { FadeIn } from "../components/FadeIn";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { AuthLoader } from "../components/AuthLoader";
import { ShareButton } from "../components/ShareButton";
import { ProductCard } from "./collections.$slug";
import { fadeUp, staggerContainer, viewportOnce, LUXE_EASE } from "../lib/motion";
import { logEvent } from "../lib/analytics";

const SITE_ORIGIN = "https://veza-studios.com";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) => {
    const p = await context.queryClient.ensureQueryData(productBySlugQuery(params.slug));
    return { product: p };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE_ORIGIN}/product/${params.slug}`;
    const p = loaderData?.product;
    if (!p) {
      return { meta: [{ title: "Piece not found — VEZA" }, { name: "robots", content: "noindex" }] };
    }
    const description = p.description
      ? p.description.replace(/\s+/g, " ").slice(0, 155)
      : `${p.name} — a VEZA piece.`;
    const img = p.images?.[0]?.url ?? null;
    const meta: Array<Record<string, string>> = [
      { title: `${p.name} — VEZA Jewelry Studios` },
      { name: "description", content: description },
      { property: "og:title", content: p.name },
      { property: "og:description", content: description },
      { property: "og:type", content: "product" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (img) {
      const abs = img.startsWith("http") ? img : `${SITE_ORIGIN}${img}`;
      meta.push({ property: "og:image", content: abs });
      meta.push({ name: "twitter:image", content: abs });
    }
    return { meta, links: [{ rel: "canonical", href: url }] };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="label-eyebrow">Not found</p>
      <h1 className="mt-6 font-serif text-5xl text-charcoal">Piece not found</h1>
      <Link to="/collections" className="btn-outline-charcoal mt-10">
        Explore Collections
      </Link>
    </div>
  ),
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product, isLoading, error } = useQuery(productBySlugQuery(slug));
  const { data: related } = useQuery(
    relatedProductsQuery(product?.collection_id ?? null, product?.id ?? ""),
  );

  useEffect(() => {
    if (product) document.title = `${product.name} — VEZA Jewelry Studios`;
  }, [product]);

  if (isLoading) return <AuthLoader minHeight="70vh" />;
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center text-sm font-light text-charcoal-soft">
        Unable to load this piece.
      </div>
    );
  }
  if (!product) throw notFound();

  return (
    <>
      <ProductBody product={product} />
      {related && related.length > 0 ? (
        <section className="border-t border-border/60 bg-warm-white">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
            <FadeIn className="mb-14 text-center">
              <p className="label-eyebrow">Complete the Look</p>
              <h2 className="mt-6 font-serif text-3xl text-charcoal md:text-4xl">
                Pieces from the same edition.
              </h2>
            </FadeIn>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
            >
              {related.map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function ProductBody({ product }: { product: Product }) {
  const images = product.images ?? [];
  const [activeIdx, setActiveIdx] = useState(0);
  const active = images[activeIdx];
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const meta = (product.metadata ?? {}) as {
    price_silver?: number | null;
    price_gold?: number | null;
    is_bespoke?: boolean;
    metal_options?: string[];
  };
  const priceGold = meta.price_gold ?? null;
  const priceSilver = meta.price_silver ?? Number(product.price);
  const hasBoth = priceGold !== null && priceSilver !== null;
  const [metal, setMetal] = useState<"silver" | "gold">(priceSilver !== null ? "silver" : "gold");
  const activePrice = metal === "gold" ? priceGold ?? Number(product.price) : priceSilver ?? Number(product.price);
  const isBespoke = !!meta.is_bespoke;

  useEffect(() => {
    logEvent("product_view", { product_id: product.id, meta: { slug: product.slug } });
  }, [product.id, product.slug]);

  return (
    <section className="bg-ivory">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:gap-16 md:px-10 md:py-24 lg:gap-20">
        <FadeIn>
          <div className="overflow-hidden">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: LUXE_EASE }}
            >
              {active ? (
                <img
                  src={active.url}
                  alt={active.alt ?? product.name}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <PlaceholderImage aspectClassName="aspect-[4/5]" glyphClassName="h-40 w-40 text-teal" />
              )}
            </motion.div>
          </div>
          {images.length > 1 ? (
            <div className="mt-6 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-20 w-20 overflow-hidden border transition-colors ${
                    i === activeIdx ? "border-teal" : "border-border/60 hover:border-teal/50"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </FadeIn>

        <FadeIn delay={0.1} className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <p className="label-eyebrow" style={{ color: "var(--color-teal)" }}>
              {product.stone ?? "VEZA"}
            </p>
            <ShareButton title={product.name} text={product.description ?? undefined} />
          </div>
          <h1 className="mt-6 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-6 font-serif text-2xl text-charcoal-soft">
            {isBespoke ? "From " : ""}{formatPrice(Number(activePrice), product.currency)}
            {isBespoke ? (
              <span className="ml-3 text-xs font-light uppercase tracking-[0.24em] text-charcoal-soft/70">
                Bespoke — final quote on request
              </span>
            ) : null}
          </p>

          {hasBoth ? (
            <div className="mt-6 inline-flex overflow-hidden border border-charcoal/60">
              <button
                type="button"
                onClick={() => setMetal("silver")}
                className={`px-4 py-2 text-[0.68rem] font-light uppercase tracking-[0.24em] transition-colors ${
                  metal === "silver" ? "bg-charcoal text-ivory" : "text-charcoal hover:bg-ivory"
                }`}
              >
                925 Silver · {formatPrice(Number(priceSilver ?? 0), product.currency)}
              </button>
              <button
                type="button"
                onClick={() => setMetal("gold")}
                className={`px-4 py-2 text-[0.68rem] font-light uppercase tracking-[0.24em] transition-colors ${
                  metal === "gold" ? "bg-charcoal text-ivory" : "text-charcoal hover:bg-ivory"
                }`}
              >
                9ct Gold · {formatPrice(Number(priceGold ?? 0), product.currency)}
              </button>
            </div>
          ) : null}

          <span className="mt-8 block h-px w-16 bg-gold" />
          {product.description ? (
            <p className="mt-8 max-w-lg text-base font-light leading-relaxed text-charcoal-soft">
              {product.description}
            </p>
          ) : null}

          <div className="mt-10 flex items-center gap-6">
            <div className="flex items-center gap-3 border border-charcoal/70 px-3 py-2">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="text-charcoal-soft transition-colors hover:text-teal"
              >
                <Minus strokeWidth={1} size={14} />
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-light">{qty}</span>
              <button
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="text-charcoal-soft transition-colors hover:text-teal"
              >
                <Plus strokeWidth={1} size={14} />
              </button>
            </div>
            <WishlistButton productId={product.id} />
          </div>

          <div className="mt-6 flex gap-4">
            {isBespoke ? (
              <Link to="/custom" className="btn-outline-charcoal flex-1 text-center">
                Begin Commission
              </Link>
            ) : (
              <button
                onClick={() => {
                  addItem(product, qty);
                  logEvent("add_to_cart", { product_id: product.id, meta: { qty, metal } });
                }}
                className="btn-outline-charcoal flex-1"
              >
                Add to Bag
              </button>
            )}
          </div>

          <div className="mt-14">
            <SpecList product={product} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function WishlistButton({ productId }: { productId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rowId, setRowId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setSaved(false);
      return;
    }
    supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setSaved(!!data);
        setRowId((data as { id: string } | null)?.id ?? null);
      });
    return () => {
      active = false;
    };
  }, [user, productId]);

  const toggle = async () => {
    if (!user) {
      navigate({ to: "/account" });
      return;
    }
    setLoading(true);
    if (saved && rowId) {
      await supabase.from("wishlists").delete().eq("id", rowId);
      setSaved(false);
      setRowId(null);
    } else {
      const { data } = await supabase
        .from("wishlists")
        .insert({ user_id: user.id, product_id: productId })
        .select("id")
        .maybeSingle();
      setSaved(true);
      setRowId((data as { id: string } | null)?.id ?? null);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`flex h-11 w-11 items-center justify-center border transition-colors duration-500 ${
        saved
          ? "border-teal bg-teal/5 text-teal"
          : "border-charcoal/70 text-charcoal hover:border-teal hover:text-teal"
      }`}
    >
      <Heart strokeWidth={1} size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}

type SpecProduct = {
  stone: string | null;
  materials: string | null;
  dimensions: string | null;
  care_instructions: string | null;
};

function SpecList({ product }: { product: SpecProduct }) {
  const specs: { label: string; value: string }[] = [
    product.stone ? { label: "Stone", value: product.stone } : null,
    product.materials ? { label: "Materials", value: product.materials } : null,
    product.dimensions ? { label: "Dimensions", value: product.dimensions } : null,
    product.care_instructions ? { label: "Care", value: product.care_instructions } : null,
    { label: "Packaging", value: "Presented in VEZA's signature gift packaging." },
    { label: "Shipping", value: "Worldwide, fully insured." },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <dl className="divide-y divide-border/60 border-y border-border/60">
      {specs.map((s) => (
        <div key={s.label} className="grid grid-cols-3 gap-6 py-5">
          <dt className="label-eyebrow">{s.label}</dt>
          <dd className="col-span-2 text-sm font-light leading-relaxed text-charcoal-soft">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
