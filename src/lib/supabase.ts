import { createClient } from "@supabase/supabase-js";

// Original VEZA production project. Hard-pinned intentionally — do NOT read
// VITE_SUPABASE_* here, the managed .env points at an empty project.
const SUPABASE_URL = "https://whyznavacdxizkrztdsi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JfFGHYs2bvSaVJQ4RRJ5Tg_9sMA7SVq";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_admin: boolean;
  must_change_password: boolean;
  created_at: string;
};

export type CollectionStatus = "draft" | "coming_soon" | "live";

export type PaymentSettings = {
  id: number;
  payments_enabled: boolean;
  stripe_publishable_key: string | null;
  currency: string;
  updated_at: string;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  story: string | null;
  hero_image_url: string | null;
  sort_order: number;
  published: boolean;
  status: CollectionStatus;
  launch_at: string | null;
  teaser: string | null;
};

export type ProductImage = { url: string; alt?: string };

export type ProductMetadata = {
  price_silver?: number | null;
  price_gold?: number | null;
  is_bespoke?: boolean;
  metal_options?: string[];
  [k: string]: unknown;
};

export type Product = {
  id: string;
  collection_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  stone: string | null;
  materials: string | null;
  dimensions: string | null;
  weight: string | null;
  care_instructions: string | null;
  images: ProductImage[] | null;
  published: boolean;
  featured: boolean;
  stock_quantity: number | null;
  metadata?: ProductMetadata | null;
};

export type Gemstone = {
  id: string;
  name: string;
  slug: string;
  origin: string | null;
  hardness: string | null;
  symbolism: string | null;
  description: string | null;
  color_variations: string | null;
  care_guide: string | null;
  zimbabwe_sourcing: string | null;
  images: ProductImage[] | null;
  published: boolean;
};

export type Order = {
  id: string;
  user_id: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  full_name: string | null;
  subscribed: boolean;
  unsubscribe_token: string;
  created_at: string;
};

export type NewsletterBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; url: string; alt?: string; caption?: string }
  | { type: "product"; name: string; price?: string; image_url?: string; url?: string }
  | { type: "divider" };

export type Newsletter = {
  id: string;
  subject: string;
  preheader: string | null;
  blocks: NewsletterBlock[];
  html: string | null;
  status: "draft" | "scheduled" | "sent" | "exported";
  scheduled_for: string | null;
  sent_at: string | null;
  recipients_count: number | null;
  created_at: string;
  updated_at: string;
};

export type AdminCalendarEvent = {
  id: string;
  title: string;
  kind: "note" | "newsletter_reminder" | "launch" | "newsletter_sent";
  event_date: string;
  meta: Record<string, unknown> | null;
  created_at: string;
};

export type NewsletterSettings = {
  id: number;
  preferred_send_day: number;
  updated_at: string;
};






export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
