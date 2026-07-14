import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  collectionBySlugQuery,
  productsByCollectionQuery,
} from "../lib/queries";
import { FadeIn } from "../components/FadeIn";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { AuthLoader } from "../components/AuthLoader";
import { formatPrice } from "../lib/cart";
import { fadeUp, staggerContainer, viewportOnce, LUXE_EASE } from "../lib/motion";
import type { Product } from "../lib/supabase";

export const Route = createFileRoute("/collections/$slug")({
  component: CollectionDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="label-eyebrow">Not found</p>
      <h1 className="mt-6 font-serif text-5xl text-charcoal">Collection not found</h1>
      <p className="mt-6 text-sm font-light text-charcoal-soft">
        The collection you're looking for has drifted out of sight.
      </p>
      <Link to="/collections" className="btn-outline-charcoal mt-10">
        View All Collections
      </Link>
    </div>
  ),
});

function CollectionDetail() {
  const { slug } = Route.useParams();
  const {
    data: collection,
    isLoading,
    error,
  } = useQuery(collectionBySlugQuery(slug));

  const { data: products, isLoading: productsLoading } = useQuery(
    productsByCollectionQuery(collection?.id),
  );

  useEffect(() => {
    if (collection) {
      document.title = `${collection.name} — VEZA Jewelry Studios`;
    }
  }, [collection]);

  if (isLoading) return <AuthLoader minHeight="70vh" />;
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center text-sm font-light text-charcoal-soft">
        Unable to load this collection. Please try again.
      </div>
    );
  }
  if (!collection) throw notFound();

  return (
    <>
      <section className="border-b border-border/60 bg-warm-white">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <FadeIn>
            <p className="label-eyebrow mb-6">Collection</p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-charcoal md:text-7xl">
              {collection.name}
            </h1>
            <span className="gold-rule mx-auto mt-10" />
            {collection.story ? (
              <p className="mt-10 mx-auto max-w-2xl font-serif text-xl font-light italic leading-relaxed text-charcoal-soft md:text-2xl">
                {collection.story}
              </p>
            ) : collection.description ? (
              <p className="mt-10 mx-auto max-w-2xl text-base font-light leading-relaxed text-charcoal-soft md:text-lg">
                {collection.description}
              </p>
            ) : null}
          </FadeIn>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          {productsLoading ? (
            <AuthLoader minHeight="30vh" />
          ) : !products || products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="label-eyebrow">Coming Soon</p>
              <p className="mt-4 font-serif text-2xl text-charcoal">
                Pieces from this collection will appear here shortly.
              </p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
            >
              {products.map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const image = product.images && product.images.length > 0 ? product.images[0] : null;
  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="group block">
      <div className="overflow-hidden">
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 1.4, ease: LUXE_EASE }}
        >
          {image ? (
            <img
              src={image.url}
              alt={image.alt ?? product.name}
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <PlaceholderImage aspectClassName="aspect-[4/5]" glyphClassName="h-24 w-24 text-teal" />
          )}
        </motion.div>
      </div>
      <div className="mt-6">
        <h3 className="font-serif text-xl text-charcoal transition-colors group-hover:text-teal md:text-2xl">
          {product.name}
        </h3>
        <p className="mt-2 text-sm font-light text-charcoal-soft">
          {formatPrice(Number(product.price), product.currency)}
        </p>
        <span className="mt-4 block h-px w-0 bg-gold transition-[width] duration-700 ease-out group-hover:w-12" />
      </div>
    </Link>
  );
}
