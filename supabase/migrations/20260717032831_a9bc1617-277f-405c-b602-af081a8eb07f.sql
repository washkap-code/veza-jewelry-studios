
-- =========================================================================
-- Shared updated_at trigger
-- =========================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================================
-- profiles (create if missing — used by RLS on other tables)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  is_admin boolean NOT NULL DEFAULT false,
  is_staff boolean NOT NULL DEFAULT false,
  must_change_password boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles self read" ON public.profiles;
CREATE POLICY "profiles self read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles self update" ON public.profiles;
CREATE POLICY "profiles self update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles self insert" ON public.profiles;
CREATE POLICY "profiles self insert"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- Journal posts
-- =========================================================================
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
CREATE POLICY "journal read published"
  ON public.journal_posts FOR SELECT
  TO anon, authenticated
  USING (
    published = true
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.is_staff = true)
    )
  );

DROP POLICY IF EXISTS "journal write staff" ON public.journal_posts;
CREATE POLICY "journal write staff"
  ON public.journal_posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.is_staff = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.is_staff = true)
    )
  );

CREATE INDEX IF NOT EXISTS journal_posts_published_idx ON public.journal_posts (published, published_at DESC);

DROP TRIGGER IF EXISTS journal_posts_updated_at ON public.journal_posts;
CREATE TRIGGER journal_posts_updated_at
  BEFORE UPDATE ON public.journal_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.journal_posts (title, slug, excerpt, content, cover_image_url, category, published, published_at, created_at)
VALUES
  (
    'Zimbabwe, quietly cut: a source of exquisite semi-precious stones',
    'zimbabwe-source-of-exquisite-stones',
    'From the Great Dyke to the granite hills of Mashonaland, Zimbabwe holds one of the most varied and least loud gemstone landscapes in the world.',
    E'There is a particular kind of stone that only Zimbabwe seems to produce — cut slowly by geology, and quietly by hand. The Great Dyke, a 550-kilometre spine of ancient rock running down the country, is one of the oldest layered intrusions on the planet. It has yielded mtorolite, a green chrome chalcedony found almost nowhere else, alongside emerald, chrysoprase and prasiolite.\n\nFurther south, aquamarine and tourmaline emerge from the granite pegmatites near Karoi and Mutoko. In the Nyanga highlands, tiger eye and garnet are lifted out of small artisanal workings the way they have been for generations — by hand, in daylight, one stone at a time.\n\nWhat sets Zimbabwean stones apart is not scarcity alone. It is the character of the sources: small, deliberate, and traceable. A stone in a VEZA piece can usually be walked back to the person who lifted it out of the ground.\n\nWe work with a shortlist of miners and cutters we know by name. Every parcel is examined stone by stone — colour, clarity, cut, and the story of where it came from. Nothing is bought blind, and nothing is bought in bulk. It is a slower way to source, and it is the only way that makes sense to us.\n\nZimbabwe is a country of quiet material wealth. Our work is simply to hold it well.',
    '/images/journal/zimbabwe-stones.jpg',
    'Origins',
    true,
    '2026-06-04T09:00:00.000Z',
    '2026-06-04T09:00:00.000Z'
  ),
  (
    'How tradition shapes the drawing table at VEZA',
    'tradition-inspires-design',
    'The forms we return to — the curve of a Shona headrest, the geometry of a woven mat — quietly find their way into every collection.',
    E'Design at VEZA rarely begins with a piece of jewellery. It begins with a shape we grew up around: the sweep of a mbira note, the geometry of a Ndebele wall, the soft curve of a soapstone headrest, the rhythm of a woven rukukwe mat.\n\nZimbabwean visual tradition is unusually generous. Sculpture, weaving, and beadwork have carried meaning in this country for centuries — and their vocabulary is quiet, architectural, and deeply personal. We treat those forms as the grammar of our house.\n\nA cocktail ring is drawn from the shoulder of a Shona figure. A pendant follows the pinch of a clay water jar. A collar borrows the strict, joyful rhythm of a Ndebele apron. None of it is decoration. It is a way of making sure a piece feels rooted before a single stone is chosen.\n\nWe are careful with what we borrow. We work with makers and cultural custodians, credit the traditions we draw on, and always leave a piece looking like itself — not like a costume.\n\nThe outcome is jewellery that feels both contemporary and familiar. Wearers often describe it the same way: it looks like something they already knew.',
    '/images/journal/tradition-design.jpg',
    'Design',
    true,
    '2026-06-18T09:00:00.000Z',
    '2026-06-18T09:00:00.000Z'
  ),
  (
    'The power of patience',
    'the-power-of-patience',
    'A VEZA piece takes as long as it takes. Slowness is not a marketing story — it is the only way a piece like this can be built.',
    E'A single ring in our atelier passes through the same pair of hands from sketch to polish. It is drawn, redrawn, carved in wax, cast, filed, set, and finished — a rhythm that unfolds over weeks, not hours.\n\nPatience is not a stylistic choice. It is a technical requirement. A bezel that will hold a soft stone for fifty years cannot be rushed. A gallery worked in gold has to be filed by eye, in daylight, and left to rest before the stone is set. Setting itself is the quietest room in the studio — a stone is placed only when everything around it is ready to hold it.\n\nWe design to this pace on purpose. It lets us make fewer pieces, know each one intimately, and correct the small things that would otherwise slip through. It also lets us listen — to the client, to the stone, and to the piece as it takes shape.\n\nOur clients feel this. The wait becomes part of the object. By the time a piece leaves the studio, it already carries a history — the sketch, the choosing, the making. Slowness is not a delay in that story. It is the story.',
    '/images/journal/patience.jpg',
    'Craftsmanship',
    true,
    '2026-07-02T09:00:00.000Z',
    '2026-07-02T09:00:00.000Z'
  ),
  (
    'Authentic stones in a lab-grown world',
    'authentic-stones-in-a-lab-grown-world',
    'As lab-grown diamonds flood the market, natural semi-precious stones are quietly becoming the last honest gem in the room.',
    E'For most of the last century, a diamond was shorthand for authenticity. That shorthand is unravelling. Laboratories can now grow diamonds by the kilo, in weeks, indistinguishable to the naked eye from stones formed over a billion years. The technology is remarkable — and it has done something quiet and permanent to how the market feels about the stone.\n\nDiamonds carry a new question now: is this one real, or is it a very good copy? Even natural diamond owners find themselves explaining. Value has drifted, and with it, meaning.\n\nSemi-precious stones sit outside that story. An aquamarine, a tourmaline, a piece of mtorolite cannot be grown in a machine at scale — they are the product of specific geology, specific place, specific time. Each one is a single object with a single history. The market for them is smaller, slower, and, increasingly, the honest one.\n\nWe hear this from clients directly. People come to us wanting a stone that will still mean the same thing in twenty years — one that cannot be replicated, that carries its origin openly. That is not nostalgia. It is a very modern instinct about what "real" is worth.\n\nSemi-precious is no longer a step down from precious. It is a step toward authenticity.',
    '/images/journal/authenticity.jpg',
    'Perspective',
    true,
    '2026-07-14T09:00:00.000Z',
    '2026-07-14T09:00:00.000Z'
  ),
  (
    'The new engagement ring: why couples are choosing semi-precious',
    'semi-precious-for-engagement-and-heirloom',
    'Aquamarine, tourmaline, morganite. The stones people are proposing with — and passing down — are quietly changing.',
    E'The traditional engagement ring is being rewritten. Couples arriving at VEZA increasingly ask, before any question of budget, for a stone that means something to them personally — often not a diamond.\n\nWhat they choose is telling. Aquamarine for its calm, deep-water blue. Green tourmaline for its association with growth. Morganite for its warmth. Mtorolite for its connection to place. These are stones with colour, character, and specificity — and, quietly, they hold their meaning better than a diamond does in 2026.\n\nThe craftsmanship is the same. A semi-precious engagement ring in our studio is drawn, carved, cast, set, and finished by the same jeweller who would set a diamond. The gallery is worked as carefully. The gold is the same. The difference is not in the making — it is in what the wearer wants to say.\n\nAnd because the stone itself is more accessible, the ring can be built more generously around it: a heavier band, a more considered setting, a piece that feels like an object rather than a solitaire. Many of our clients spend the same, and go home with something that will read as heirloom in a generation.\n\nThat is really the point. An engagement ring is a piece that is meant to be passed on. A stone with a place, a history, and a maker will always travel better through time than one that could have been grown in a lab yesterday.',
    '/images/journal/engagement.jpg',
    'Bespoke',
    true,
    '2026-07-28T09:00:00.000Z',
    '2026-07-28T09:00:00.000Z'
  )
ON CONFLICT (slug) DO NOTHING;

-- =========================================================================
-- Admin notifications
-- =========================================================================
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
CREATE POLICY "notifications insert any"
  ON public.admin_notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "notifications admin read" ON public.admin_notifications;
CREATE POLICY "notifications admin read"
  ON public.admin_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.is_staff = true)
    )
  );

DROP POLICY IF EXISTS "notifications admin update" ON public.admin_notifications;
CREATE POLICY "notifications admin update"
  ON public.admin_notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.is_staff = true)
    )
  )
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS admin_notifications_created_idx ON public.admin_notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_notifications_unread_idx ON public.admin_notifications (read, created_at DESC) WHERE read = false;
