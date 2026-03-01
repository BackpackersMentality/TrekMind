import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

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
    target: "es2020",
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── React core MUST be a single chunk — any split causes
          //    "duplicate React" which breaks context and gives the
          //    "Cannot set properties of undefined" blank screen error.
          //    Keep react, react-dom, and wouter together always.
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/") ||
            id.includes("node_modules/wouter/")
          ) {
            return "vendor-react";
          }

          // ── Mapbox: largest dep (~300KB gz), only on trek detail page ──
          if (id.includes("node_modules/mapbox-gl/")) {
            return "vendor-mapbox";
          }

          // ── Framer Motion: only used in TrekPreviewPanel ──
          if (id.includes("node_modules/framer-motion/")) {
            return "vendor-framer";
          }

          // ── Radix UI: all primitives together ──
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }

          // ── Everything else stays in Vite's default chunking ──
          // Do NOT add a catch-all "vendor-misc" — that's what caused
          // the duplicate React issue (misc chunk included React internals
          // separately from the vendor-react chunk).
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
});
