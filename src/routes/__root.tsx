import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { AuthProvider } from "../lib/auth";
import { CartProvider } from "../lib/cart";
import CartDrawer from "../components/CartDrawer";
import Preloader from "../components/Preloader";
import PasswordChangeGate from "../components/PasswordChangeGate";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="max-w-md text-center">
        <p className="label-eyebrow">Four — Zero — Four</p>
        <h1 className="mt-6 font-serif text-6xl text-charcoal">Not found</h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-charcoal-soft">
          The page you are looking for has drifted out of sight.
        </p>
        <div className="mt-10">
          <Link to="/" className="btn-outline-charcoal">Return home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="max-w-md text-center">
        <p className="label-eyebrow">A moment</p>
        <h1 className="mt-6 font-serif text-4xl text-charcoal">This page didn't load</h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-charcoal-soft">
          Something interrupted our craft. Please try again.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-outline-charcoal"
          >
            Try again
          </button>
          <a href="/" className="btn-outline-charcoal">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VEZA Jewelry Studios — Contemporary African Luxury" },
      {
        name: "description",
        content:
          "VEZA Jewelry Studios — a contemporary African luxury jewelry design house from Harare, Zimbabwe. Sculpted by nature, crafted by hand.",
      },
      { name: "author", content: "VEZA Jewelry Studios" },
      { property: "og:title", content: "VEZA Jewelry Studios — Contemporary African Luxury" },
      {
        property: "og:description",
        content:
          "VEZA Jewelry Studios — a contemporary African luxury jewelry design house from Harare, Zimbabwe. Sculpted by nature, crafted by hand.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "VEZA Jewelry Studios" },
      { property: "og:url", content: "https://veza-jewelry-studios.lovable.app/" },
      { property: "og:image", content: "https://veza-jewelry-studios.lovable.app/og-image.jpg?v=3" },
      { property: "og:image:secure_url", content: "https://veza-jewelry-studios.lovable.app/og-image.jpg?v=3" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "VEZA Jewelry Studios" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "VEZA Jewelry Studios — Contemporary African Luxury" },
      { name: "twitter:description", content: "VEZA Jewelry Studios — a contemporary African luxury jewelry design house from Harare, Zimbabwe. Sculpted by nature, crafted by hand." },
      { name: "twitter:image", content: "https://veza-jewelry-studios.lovable.app/og-image.jpg?v=3" },
      { name: "twitter:image:alt", content: "VEZA Jewelry Studios" },
      { name: "theme-color", content: "#4EA085" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "VEZA" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg?v=3", type: "image/svg+xml" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png?v=3" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png?v=3" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/favicon-512.png?v=3" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png?v=3" },
      { rel: "mask-icon", href: "/favicon.svg?v=3", color: "#4EA085" },
      { rel: "manifest", href: "/site.webmanifest?v=3" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const isStudio = pathname === "/studio";

  useEffect(() => {
    // Fire page_view for real traffic only (no SSR).
    if (typeof window === "undefined") return;
    import("../lib/analytics").then(({ logEvent }) =>
      logEvent("page_view", { path: pathname }),
    );
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <PasswordChangeGate />
          <Preloader />
          <div className="min-h-screen bg-ivory text-charcoal">
            {isStudio ? null : <Navigation />}
            <main className={isHome || isStudio ? "" : "pt-24 md:pt-28"}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
            {isStudio ? null : <Footer />}
            <CartDrawer />
          </div>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

}
