-- =========================================================================
-- VEZA — journal_posts + admin_notifications
-- Run in the production Supabase SQL editor. Safe to re-run.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- journal_posts --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journal_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  cover_image_url text,
  category text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.journal_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_posts TO authenticated;
GRANT ALL ON public.journal_posts TO service_role;
ALTER TABLE public.journal_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "journal read published" ON public.journal_posts;
CREATE POLICY "journal read published" ON public.journal_posts FOR SELECT TO anon, authenticated
  USING (published = true OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.is_admin OR p.is_staff)));

DROP POLICY IF EXISTS "journal write staff" ON public.journal_posts;
CREATE POLICY "journal write staff" ON public.journal_posts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.is_admin OR p.is_staff)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.is_admin OR p.is_staff)));

CREATE INDEX IF NOT EXISTS journal_posts_published_idx ON public.journal_posts (published, published_at DESC);
DROP TRIGGER IF EXISTS journal_posts_updated_at ON public.journal_posts;
CREATE TRIGGER journal_posts_updated_at BEFORE UPDATE ON public.journal_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the five on-site journal entries (idempotent by slug)
INSERT INTO public.journal_posts (title, slug, excerpt, cover_image_url, category, published, published_at, created_at) VALUES
  ('Zimbabwe, quietly cut: a source of exquisite semi-precious stones','zimbabwe-source-of-exquisite-stones','From the Great Dyke to the granite hills of Mashonaland, Zimbabwe holds one of the most varied and least loud gemstone landscapes in the world.','/images/journal/zimbabwe-stones.jpg','Origins',true,'2026-06-04T09:00:00Z','2026-06-04T09:00:00Z'),
  ('How tradition shapes the drawing table at VEZA','tradition-inspires-design','The forms we return to — the curve of a Shona headrest, the geometry of a woven mat — quietly find their way into every collection.','/images/journal/tradition-design.jpg','Design',true,'2026-06-18T09:00:00Z','2026-06-18T09:00:00Z'),
  ('The power of patience','the-power-of-patience','A VEZA piece takes as long as it takes. Slowness is not a marketing story — it is the only way a piece like this can be built.','/images/journal/patience.jpg','Craftsmanship',true,'2026-07-02T09:00:00Z','2026-07-02T09:00:00Z'),
  ('Authentic stones in a lab-grown world','authentic-stones-in-a-lab-grown-world','As lab-grown diamonds flood the market, natural semi-precious stones are quietly becoming the last honest gem in the room.','/images/journal/authenticity.jpg','Perspective',true,'2026-07-14T09:00:00Z','2026-07-14T09:00:00Z'),
  ('The new engagement ring: why couples are choosing semi-precious','semi-precious-for-engagement-and-heirloom','Aquamarine, tourmaline, morganite. The stones people are proposing with — and passing down — are quietly changing.','/images/journal/engagement.jpg','Bespoke',true,'2026-07-28T09:00:00Z','2026-07-28T09:00:00Z')
ON CONFLICT (slug) DO NOTHING;
-- NOTE: full body text for each post lives in src/content/journal.ts; the
-- storefront falls back to it until you replace excerpts/content from the
-- admin editor.

-- admin_notifications --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  title text NOT NULL,
  message text,
  link text,
  meta jsonb,
  read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  read_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.admin_notifications TO anon;
GRANT SELECT, INSERT, UPDATE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications insert any" ON public.admin_notifications;
CREATE POLICY "notifications insert any" ON public.admin_notifications FOR INSERT TO anon, authenticated
  WITH CHECK (length(coalesce(kind, '')) > 0 AND length(coalesce(title, '')) > 0 AND read = false);

DROP POLICY IF EXISTS "notifications admin read" ON public.admin_notifications;
CREATE POLICY "notifications admin read" ON public.admin_notifications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.is_admin OR p.is_staff)));

DROP POLICY IF EXISTS "notifications admin update" ON public.admin_notifications;
CREATE POLICY "notifications admin update" ON public.admin_notifications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.is_admin OR p.is_staff)))
  WITH CHECK (read = true AND (read_by IS NULL OR read_by = auth.uid()));

CREATE INDEX IF NOT EXISTS admin_notifications_created_idx ON public.admin_notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_notifications_unread_idx ON public.admin_notifications (read, created_at DESC) WHERE read = false;
