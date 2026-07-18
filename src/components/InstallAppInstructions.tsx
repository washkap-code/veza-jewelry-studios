import { useState, useEffect } from "react";
import { Smartphone, Download } from "lucide-react";

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

/**
 * Install-the-web-app instructions for the login pages. Uses the browser's
 * `beforeinstallprompt` event when available (Chrome/Edge desktop + Android),
 * and falls back to platform-specific manual steps for iOS Safari.
 */
export function InstallAppInstructions({ tone = "light" }: { tone?: "light" | "dark" } = {}) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [deferred, setDeferred] = useState<null | {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    // Detect if already installed (running as standalone)
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari flag
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as never);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }
    window.addEventListener("beforeinstallprompt", onPrompt as EventListener);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    setDeferred(null);
  }

  if (installed) return null;

  const dark = tone === "dark";
  const wrap = dark
    ? "mt-6 border border-ivory/20 bg-ivory/5"
    : "mt-6 border border-border/60 bg-warm-white/60";
  const trigger = dark
    ? "flex w-full items-center justify-between gap-4 px-5 py-3 text-left transition-colors duration-300 hover:bg-ivory/10"
    : "flex w-full items-center justify-between gap-4 px-5 py-3 text-left transition-colors duration-300 hover:bg-warm-white";
  const icon = dark ? "h-4 w-4 text-gold" : "h-4 w-4 text-teal";
  const eyebrow = dark
    ? "text-[0.68rem] font-light uppercase tracking-[0.24em] text-ivory/80"
    : "label-eyebrow";
  const hint = dark
    ? "text-[0.65rem] font-light uppercase tracking-[0.22em] text-ivory/50"
    : "text-[0.65rem] font-light uppercase tracking-[0.22em] text-charcoal-soft";
  const body = dark
    ? "border-t border-ivory/15 px-5 py-5 text-xs font-light leading-relaxed text-ivory/70"
    : "border-t border-border/60 px-5 py-5 text-xs font-light leading-relaxed text-charcoal-soft";
  const emph = dark ? "text-ivory" : "text-charcoal";

  return (
    <div className={wrap}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={trigger}
      >
        <span className="flex items-center gap-3">
          <Smartphone className={icon} strokeWidth={1.4} />
          <span className={eyebrow}>Install the VEZA app</span>
        </span>
        <span className={hint}>
          {open ? "Hide" : "How"}
        </span>
      </button>

      {open ? (
        <div className="border-t border-border/60 px-5 py-5 text-xs font-light leading-relaxed text-charcoal-soft">
          {deferred ? (
            <div className="mb-4">
              <button
                type="button"
                onClick={install}
                className="btn-outline-charcoal inline-flex items-center gap-2"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} /> Install VEZA
              </button>
              <p className="mt-3 text-[0.7rem] text-charcoal-soft/80">
                Your browser can install VEZA directly. If nothing happens, follow the manual steps
                below.
              </p>
            </div>
          ) : null}

          {platform === "ios" ? (
            <ol className="list-decimal space-y-1.5 pl-4">
              <li>Open this page in <span className="text-charcoal">Safari</span> on your iPhone or iPad.</li>
              <li>
                Tap the <span className="text-charcoal">Share</span> button
                <span aria-hidden> (□↑)</span> at the bottom of the screen.
              </li>
              <li>Scroll and tap <span className="text-charcoal">Add to Home Screen</span>.</li>
              <li>Tap <span className="text-charcoal">Add</span> — the VEZA icon appears with your other apps.</li>
            </ol>
          ) : platform === "android" ? (
            <ol className="list-decimal space-y-1.5 pl-4">
              <li>Open this page in <span className="text-charcoal">Chrome</span> on your Android device.</li>
              <li>
                Tap the <span className="text-charcoal">⋮</span> menu (top right).
              </li>
              <li>
                Tap <span className="text-charcoal">Install app</span> or{" "}
                <span className="text-charcoal">Add to Home screen</span>.
              </li>
              <li>Confirm — VEZA installs like any other app.</li>
            </ol>
          ) : (
            <ol className="list-decimal space-y-1.5 pl-4">
              <li>
                Open this site in <span className="text-charcoal">Chrome</span>,{" "}
                <span className="text-charcoal">Edge</span> or{" "}
                <span className="text-charcoal">Brave</span> on your computer.
              </li>
              <li>
                Look for the <span className="text-charcoal">install icon</span> at the right edge
                of the address bar (a small monitor with an arrow).
              </li>
              <li>
                Or open the browser menu and choose{" "}
                <span className="text-charcoal">Install VEZA</span> /{" "}
                <span className="text-charcoal">Apps &rarr; Install this site as an app</span>.
              </li>
              <li>
                On <span className="text-charcoal">Safari (macOS 14+)</span>: File &rarr;{" "}
                <span className="text-charcoal">Add to Dock</span>.
              </li>
            </ol>
          )}

          <p className="mt-4 text-[0.68rem] text-charcoal-soft/70">
            Once installed, VEZA opens in its own window — no browser bar, faster launch, and
            straight to sign-in.
          </p>
        </div>
      ) : null}
    </div>
  );
}
