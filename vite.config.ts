import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { compression } from "vite-plugin-compression2";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // main.tsx registers /sw.js itself (with an hourly update check); don't inject a second registration.
      injectRegister: false,
      includeAssets: ["favicon.svg", "robots.txt", "icons/apple-touch-icon.png"],
      manifest: {
        name: "UhaiLink — Emergency Medical ID",
        short_name: "UhaiLink",
        description:
          "Your medical identity, ready when seconds matter: a QR medical ID for first responders and an SOS that alerts your emergency contacts.",
        theme_color: "#1D5FD6",
        background_color: "#F7F9FC",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        categories: ["health", "medical", "emergency"],
        lang: "en",
        icons: [
          { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      workbox: {
        // Cache strategies for different resource types.
        // Medical, account and emergency data must never reach Cache Storage, so only
        // public read-only content is cached; every other Supabase request is network-only.
        runtimeCaching: [
          {
            // Public learning content and the emergency directory - Network First (offline fallback)
            urlPattern:
              /^https:\/\/[a-z0-9-]+\.supabase\.co\/rest\/v1\/(emergency_organizations|tutorials|articles|webinars|downloadable_materials)(\?|$)/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-public-content",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            // Public Storage objects only (e.g. learning thumbnails) - Cache First
            urlPattern:
              /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-public-storage",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            // Everything else on Supabase (auth, profiles, contacts, incidents, QR scans,
            // chat, Edge Functions, private storage) - Network Only
            urlPattern: /^https:\/\/[a-z0-9-]+\.supabase\.co\/.*/i,
            handler: "NetworkOnly",
          },
        ],
        // Precache the app shell. Fonts: only the Latin upright files (other subsets
        // still load on demand through unicode-range).
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Not precached: non-Latin font subsets, admin chunks (admin data is network-only, so
        // admin pages are unusable offline anyway) and the social preview image (crawlers only).
        globIgnores: [
          "**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese,latin-ext}-*.woff2",
          "**/*-italic*.woff2",
          "**/assets/Admin*.js",
          "og-image.png",
        ],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false, // Don't enable SW in dev mode
      },
    }),
    // Gzip compression for production builds
    compression({
      algorithm: "gzip",
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Only React is grouped (needed on every route). Other libraries, notably recharts,
    // are split by Rollup per route so public and responder pages don't download them.
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
        },
        // Fold tiny side-effect-free chunks (mostly single icons) into their neighbours:
        // each one otherwise costs a round trip on slow mobile connections.
        experimentalMinChunkSize: 10_000,
      },
    },
    // Target modern browsers for smaller bundles
    target: "es2020",
    // Enable source maps for error tracking
    sourcemap: true,
  },
});
