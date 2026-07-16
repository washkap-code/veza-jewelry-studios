import type { JournalPost } from "../lib/queries";

/**
 * First-party editorial entries. These render through the same routes as
 * journal_posts rows and are merged with the database results (DB rows win
 * on slug collision so editors can override any static entry).
 */
export const STATIC_JOURNAL_POSTS: JournalPost[] = [
  {
    id: "static-zimbabwe-source",
    slug: "zimbabwe-source-of-exquisite-stones",
    title: "Zimbabwe, quietly cut: a source of exquisite semi-precious stones",
    excerpt:
      "From the Great Dyke to the granite hills of Mashonaland, Zimbabwe holds one of the most varied and least loud gemstone landscapes in the world.",
    content:
      "There is a particular kind of stone that only Zimbabwe seems to produce — cut slowly by geology, and quietly by hand. The Great Dyke, a 550-kilometre spine of ancient rock running down the country, is one of the oldest layered intrusions on the planet. It has yielded mtorolite, a green chrome chalcedony found almost nowhere else, alongside emerald, chrysoprase and prasiolite.\n\nFurther south, aquamarine and tourmaline emerge from the granite pegmatites near Karoi and Mutoko. In the Nyanga highlands, tiger eye and garnet are lifted out of small artisanal workings the way they have been for generations — by hand, in daylight, one stone at a time.\n\nWhat sets Zimbabwean stones apart is not scarcity alone. It is the character of the sources: small, deliberate, and traceable. A stone in a VEZA piece can usually be walked back to the person who lifted it out of the ground.\n\nWe work with a shortlist of miners and cutters we know by name. Every parcel is examined stone by stone — colour, clarity, cut, and the story of where it came from. Nothing is bought blind, and nothing is bought in bulk. It is a slower way to source, and it is the only way that makes sense to us.\n\nZimbabwe is a country of quiet material wealth. Our work is simply to hold it well.",
    cover_image_url: "/images/journal/zimbabwe-stones.jpg",
    category: "Origins",
    published: true,
    published_at: "2026-06-04T09:00:00.000Z",
    created_at: "2026-06-04T09:00:00.000Z",
  },
  {
    id: "static-tradition-design",
    slug: "tradition-inspires-design",
    title: "How tradition shapes the drawing table at VEZA",
    excerpt:
      "The forms we return to — the curve of a Shona headrest, the geometry of a woven mat — quietly find their way into every collection.",
    content:
      "Design at VEZA rarely begins with a piece of jewellery. It begins with a shape we grew up around: the sweep of a mbira note, the geometry of a Ndebele wall, the soft curve of a soapstone headrest, the rhythm of a woven rukukwe mat.\n\nZimbabwean visual tradition is unusually generous. Sculpture, weaving, and beadwork have carried meaning in this country for centuries — and their vocabulary is quiet, architectural, and deeply personal. We treat those forms as the grammar of our house.\n\nA cocktail ring is drawn from the shoulder of a Shona figure. A pendant follows the pinch of a clay water jar. A collar borrows the strict, joyful rhythm of a Ndebele apron. None of it is decoration. It is a way of making sure a piece feels rooted before a single stone is chosen.\n\nWe are careful with what we borrow. We work with makers and cultural custodians, credit the traditions we draw on, and always leave a piece looking like itself — not like a costume.\n\nThe outcome is jewellery that feels both contemporary and familiar. Wearers often describe it the same way: it looks like something they already knew.",
    cover_image_url: "/images/journal/tradition-design.jpg",
    category: "Design",
    published: true,
    published_at: "2026-06-18T09:00:00.000Z",
    created_at: "2026-06-18T09:00:00.000Z",
  },
  {
    id: "static-patience",
    slug: "the-power-of-patience",
    title: "The power of patience",
    excerpt:
      "A VEZA piece takes as long as it takes. Slowness is not a marketing story — it is the only way a piece like this can be built.",
    content:
      "A single ring in our atelier passes through the same pair of hands from sketch to polish. It is drawn, redrawn, carved in wax, cast, filed, set, and finished — a rhythm that unfolds over weeks, not hours.\n\nPatience is not a stylistic choice. It is a technical requirement. A bezel that will hold a soft stone for fifty years cannot be rushed. A gallery worked in gold has to be filed by eye, in daylight, and left to rest before the stone is set. Setting itself is the quietest room in the studio — a stone is placed only when everything around it is ready to hold it.\n\nWe design to this pace on purpose. It lets us make fewer pieces, know each one intimately, and correct the small things that would otherwise slip through. It also lets us listen — to the client, to the stone, and to the piece as it takes shape.\n\nOur clients feel this. The wait becomes part of the object. By the time a piece leaves the studio, it already carries a history — the sketch, the choosing, the making. Slowness is not a delay in that story. It is the story.",
    cover_image_url: "/images/journal/patience.jpg",
    category: "Craftsmanship",
    published: true,
    published_at: "2026-07-02T09:00:00.000Z",
    created_at: "2026-07-02T09:00:00.000Z",
  },
  {
    id: "static-authentic-stones",
    slug: "authentic-stones-in-a-lab-grown-world",
    title: "Authentic stones in a lab-grown world",
    excerpt:
      "As lab-grown diamonds flood the market, natural semi-precious stones are quietly becoming the last honest gem in the room.",
    content:
      "For most of the last century, a diamond was shorthand for authenticity. That shorthand is unravelling. Laboratories can now grow diamonds by the kilo, in weeks, indistinguishable to the naked eye from stones formed over a billion years. The technology is remarkable — and it has done something quiet and permanent to how the market feels about the stone.\n\nDiamonds carry a new question now: is this one real, or is it a very good copy? Even natural diamond owners find themselves explaining. Value has drifted, and with it, meaning.\n\nSemi-precious stones sit outside that story. An aquamarine, a tourmaline, a piece of mtorolite cannot be grown in a machine at scale — they are the product of specific geology, specific place, specific time. Each one is a single object with a single history. The market for them is smaller, slower, and, increasingly, the honest one.\n\nWe hear this from clients directly. People come to us wanting a stone that will still mean the same thing in twenty years — one that cannot be replicated, that carries its origin openly. That is not nostalgia. It is a very modern instinct about what \"real\" is worth.\n\nSemi-precious is no longer a step down from precious. It is a step toward authenticity.",
    cover_image_url: "/images/journal/authenticity.jpg",
    category: "Perspective",
    published: true,
    published_at: "2026-07-14T09:00:00.000Z",
    created_at: "2026-07-14T09:00:00.000Z",
  },
  {
    id: "static-engagement",
    slug: "semi-precious-for-engagement-and-heirloom",
    title: "The new engagement ring: why couples are choosing semi-precious",
    excerpt:
      "Aquamarine, tourmaline, morganite. The stones people are proposing with — and passing down — are quietly changing.",
    content:
      "The traditional engagement ring is being rewritten. Couples arriving at VEZA increasingly ask, before any question of budget, for a stone that means something to them personally — often not a diamond.\n\nWhat they choose is telling. Aquamarine for its calm, deep-water blue. Green tourmaline for its association with growth. Morganite for its warmth. Mtorolite for its connection to place. These are stones with colour, character, and specificity — and, quietly, they hold their meaning better than a diamond does in 2026.\n\nThe craftsmanship is the same. A semi-precious engagement ring in our studio is drawn, carved, cast, set, and finished by the same jeweller who would set a diamond. The gallery is worked as carefully. The gold is the same. The difference is not in the making — it is in what the wearer wants to say.\n\nAnd because the stone itself is more accessible, the ring can be built more generously around it: a heavier band, a more considered setting, a piece that feels like an object rather than a solitaire. Many of our clients spend the same, and go home with something that will read as heirloom in a generation.\n\nThat is really the point. An engagement ring is a piece that is meant to be passed on. A stone with a place, a history, and a maker will always travel better through time than one that could have been grown in a lab yesterday.",
    cover_image_url: "/images/journal/engagement.jpg",
    category: "Bespoke",
    published: true,
    published_at: "2026-07-28T09:00:00.000Z",
    created_at: "2026-07-28T09:00:00.000Z",
  },
];
