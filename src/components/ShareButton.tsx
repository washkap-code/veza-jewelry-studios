import { useState, useEffect, useRef } from "react";
import { Share2, Check, Copy, Instagram, Facebook, Twitter, MessageCircle } from "lucide-react";

type Props = {
  url?: string;
  title: string;
  text?: string;
  className?: string;
};

export function ShareButton({ url, title, text, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  const shareUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text ?? title);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> })
          .share({ title, text, url: shareUrl });
        return true;
      } catch {
        /* user cancelled */
      }
    }
    return false;
  }

  async function onTrigger() {
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
    if (isMobile && (await nativeShare())) return;
    setOpen((o) => !o);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  }

  const targets = [
    {
      key: "instagram",
      label: "Instagram",
      icon: Instagram,
      // Instagram has no web share intent; copy link + open profile
      onClick: async () => {
        await copy();
        window.open("https://www.instagram.com/veza_studios", "_blank", "noopener");
      },
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: "x",
      label: "X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    },
    {
      key: "pinterest",
      label: "Pinterest",
      // Pinterest brand icon isn't in lucide; reuse a subtle glyph
      icon: Share2,
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
    },
  ] as const;

  return (
    <div ref={wrap} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={onTrigger}
        aria-label="Share this piece"
        aria-expanded={open}
        className="inline-flex items-center gap-2 text-[0.68rem] font-light uppercase tracking-[0.24em] text-charcoal-soft transition-colors duration-500 hover:text-teal"
      >
        <Share2 strokeWidth={1} size={14} />
        Share
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-3 w-56 border border-border/60 bg-warm-white p-2 shadow-[0_8px_30px_rgba(20,30,40,0.08)]"
        >
          {targets.map((t) =>
            "href" in t ? (
              <a
                key={t.key}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 text-xs font-light tracking-wide text-charcoal transition-colors hover:bg-ivory hover:text-teal"
              >
                <t.icon strokeWidth={1} size={14} />
                {t.label}
              </a>
            ) : (
              <button
                key={t.key}
                type="button"
                onClick={t.onClick}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs font-light tracking-wide text-charcoal transition-colors hover:bg-ivory hover:text-teal"
              >
                <t.icon strokeWidth={1} size={14} />
                {t.label}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={copy}
            className="mt-1 flex w-full items-center gap-3 border-t border-border/60 px-3 py-2 text-left text-xs font-light tracking-wide text-charcoal transition-colors hover:bg-ivory hover:text-teal"
          >
            {copied ? <Check strokeWidth={1} size={14} /> : <Copy strokeWidth={1} size={14} />}
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ShareButton;
