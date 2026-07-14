import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://whyznavacdxizkrztdsi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JfFGHYs2bvSaVJQ4RRJ5Tg_9sMA7SVq";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
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
};

export type ProductImage = { url: string; alt?: string };

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

export type Wishlist = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};




export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
