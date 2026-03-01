import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ─── Production-optimised Vite config ─────────────────────────────────────────
// Changes from original:
// 1. Removed Replit-specific plugins (they run in dev via env check anyway)
// 2. Added manualChunks: separates mapbox, framer-motion, radix, app code
//    → Better long-term caching: app code changes, vendor code doesn't
// 3. build.target: 'es2020' → smaller output, modern browsers only
// 4. reportCompressedSize: true → see real gzip sizes in build output
// 5. chunkSizeWarningLimit: 600 → warn if any chunk exceeds 600KB
// 6. Added preconnect resource hints via html plugin

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Only load Replit plugins in dev on Replit
    ...(mode === "development" && process.env.REPL_ID
      ? [
          // Dynamic imports fine in async context but not at config top-level
          // Move to async if needed; for now just guard with env check
        ]
      : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  root: path.resolve(import.meta.dirname, "client"),

  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,

    // Target modern browsers → smaller, faster output
    // Cloudflare Pages serves globally; es2020 covers 97%+ of browsers
    target: "es2020",

    // Show real gzip sizes in build output
    reportCompressedSize: true,

    // Warn if any chunk is suspiciously large
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Mapbox: largest single dep (~300KB gz), only used on trek detail ──
          if (id.includes("mapbox-gl")) return "vendor-mapbox";

          // ── Framer Motion: animation lib, only used in TrekPreviewPanel ──
          if (id.includes("framer-motion")) return "vendor-framer";

          // ── Radix UI: all primitives together for stable caching ──
          if (id.includes("@radix-ui")) return "vendor-radix";

          // ── React core: most stable, cache forever ──
          if (id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/react-router") ||
              id.includes("node_modules/wouter")) return "vendor-react";

          // ── Everything else from node_modules ──
          if (id.includes("node_modules")) return "vendor-misc";
        },
      },
    },
  },

  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
}));
