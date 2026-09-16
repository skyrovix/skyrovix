import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";

const SITE_URL = "https://skyrovix.online";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold brand-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md brand-gradient px-4 py-2 text-sm font-medium text-white"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  
  // Automatically reload on dynamic import / chunk load failures (rate-limited to prevent infinite loop)
  if (typeof window !== "undefined") {
    const isChunkError =
      error.message?.includes("Failed to fetch dynamically imported module") ||
      error.message?.includes("ChunkLoadError") ||
      error.name === "ChunkLoadError" ||
      error.stack?.includes("ChunkLoadError") ||
      error.stack?.includes("Failed to fetch dynamically imported module");
      
    if (isChunkError) {
      const now = Date.now();
      const lastReload = sessionStorage.getItem("last_chunk_error_reload");
      if (!lastReload || now - parseInt(lastReload) > 15000) {
        sessionStorage.setItem("last_chunk_error_reload", now.toString());
        console.warn("Chunk load error detected, forcing automatic page reload...");
        window.location.reload();
        return null;
      } else {
        console.error("Chunk load error persisted after reload, stopping loop.", error);
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="mt-6 rounded-md brand-gradient px-4 py-2 text-sm font-medium text-white"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Default title & description — overridden by each per-route head()
      { title: "Skyrovix Internship | Virtual Internship with Certificate & Real Projects" },
      { name: "description", content: "Join Skyrovix Virtual Internship Program and gain hands-on experience through real-world projects. Get an Offer Letter, Internship Certificate, mentor support, and industry-ready skills in Full Stack, AI, Python, Data Science, Cyber Security, Cloud, UI/UX, and more." },
      { name: "keywords", content: "Skyrovix Internship, Skyrovix Virtual Internship, Skyrovix IT Solutions Internship, online internship India, virtual internship with certificate, remote internship for students, project based internship, full stack development internship, Python internship, Java internship, AI internship, machine learning internship, data science internship, cyber security internship, cloud computing internship, React internship, MERN stack internship, UI UX internship, graphic design internship, internship with offer letter, internship with certificate, internship with real projects, internship for college students, engineering internship, computer science internship, free internship, work from home internship, summer internship 2026, internship program India, best virtual internship for engineering students, online internship with certificate and offer letter, internship with QR verified certificate, internship for CSE students, internship for IT students, web development internship India" },
      { name: "author", content: "Skyrovix" },
      { name: "publisher", content: "Skyrovix" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "theme-color", content: "#07284a" },
      { name: "msapplication-TileColor", content: "#07284a" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Skyrovix" },
      { name: "application-name", content: "Skyrovix" },
      { name: "format-detection", content: "telephone=no" },
      // Geo tags for India-local SEO
      { name: "geo.region", content: "IN" },
      { name: "geo.placename", content: "India" },
      { name: "geo.position", content: "20.5937;78.9629" },
      { name: "ICBM", content: "20.5937, 78.9629" },
      // Open Graph defaults
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "Skyrovix Internship | Virtual Internship with Certificate & Real Projects" },
      { property: "og:description", content: "Join Skyrovix Virtual Internship Program and gain hands-on experience through real-world projects. Get an Offer Letter, Certificate, mentor support, and industry-ready skills." },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/og-default.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Skyrovix — Virtual Internship & Training Platform" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:locale", content: "en_IN" },
      // Twitter Card defaults
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Skyrovix Internship | Virtual Internship with Certificate & Real Projects" },
      { name: "twitter:description", content: "Join Skyrovix Virtual Internship Program. Get an Offer Letter, Certificate & real project experience in Full Stack, AI, Python, Data Science, Cyber Security, Cloud, UI/UX & more." },
      { name: "twitter:image", content: `${SITE_URL}/og-default.png` },
      { name: "twitter:image:alt", content: "Skyrovix Virtual Internship with Certificate & Real Projects" },
      { name: "twitter:site", content: "@skyrovix" },
      { name: "twitter:creator", content: "@skyrovix" },
      { name: "google-adsense-account", content: "ca-pub-5755024838228586" },
      { httpEquiv: "X-Content-Type-Options", content: "nosniff" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { rel: "canonical", href: SITE_URL },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "preconnect", href: "https://www.googletagmanager.com", crossOrigin: "" },
      { rel: "preconnect", href: "https://pagead2.googlesyndication.com", crossOrigin: "" },
      { rel: "dns-prefetch", href: "https://pagead2.googlesyndication.com" },
      { rel: "dns-prefetch", href: "https://www.clarity.ms" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
      { rel: "icon", type: "image/png", href: "/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "icon", type: "image/png", href: "/android-chrome-512x512.png", sizes: "512x512" },
      // hreflang for India English (hrefLang is the correct React prop)
      { rel: "alternate", hrefLang: "en-IN", href: SITE_URL },
      { rel: "alternate", hrefLang: "en", href: SITE_URL },
      { rel: "alternate", hrefLang: "x-default", href: SITE_URL },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function ExternalScripts() {
  const router = useRouter();

  useEffect(() => {
    // 1. Google AdSense (Client-side load to prevent SSR hydration mismatch)
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const adsScript = document.createElement("script");
      adsScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5755024838228586";
      adsScript.async = true;
      adsScript.crossOrigin = "anonymous";
      document.head.appendChild(adsScript);
    }

    // 2. Google Tag Manager (gtag.js)
    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      const gtagScript = document.createElement("script");
      gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-FD15M64DX5";
      gtagScript.async = true;
      document.head.appendChild(gtagScript);

      const win = window as any;
      win.dataLayer = win.dataLayer || [];
      function gtag(...args: any[]) {
        win.dataLayer.push(args);
      }
      win.gtag = gtag;
      gtag("js", new Date());
      gtag("config", "G-FD15M64DX5", {
        page_path: window.location.pathname,
      });
    }

    // 3. Microsoft Clarity
    if (!document.querySelector('script[src*="clarity.ms"]')) {
      (function(c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
        c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", "xd0wqj67e6");
    }
  }, []);

  // Track SPA page navigation in Google Analytics
  useEffect(() => {
    return router.subscribe("onResolved", ({ toLocation }) => {
      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("config", "G-FD15M64DX5", {
          page_path: toLocation.pathname,
        });
      }
    });
  }, [router]);

  return null;
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="bg-[#f8fafc] dark:bg-[#070b19]" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <div className="w-full overflow-x-hidden">
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const isRecovery =
      hash.includes("type=recovery") ||
      search.includes("type=recovery") ||
      (hash.includes("access_token=") && hash.includes("type=recovery"));

    if (isRecovery) {
      const h = window.location.hostname.toLowerCase();
      const isLocal = h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h.startsWith("192.168.");
      if (isLocal) {
        console.log("[Root] Recovery tokens detected on localhost, forwarding to production domain reset-password...");
        window.location.replace(`https://skyrovix.online/reset-password${search}${hash}`);
        return;
      }
      if (!window.location.pathname.startsWith("/reset-password")) {
        console.log("[Root] Recovery tokens detected at root, redirecting to /reset-password...");
        window.location.replace(`/reset-password${search}${hash}`);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ExternalScripts />
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
