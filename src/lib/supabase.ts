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

export type Product = {
  id: string;
  collection_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  images: Array<{ url: string; alt?: string }> | null;
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
