import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Split large, stable third-party libraries into their own long-lived
    // chunks so app updates don't invalidate the entire vendor cache.
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          charts: ["recharts"],
          motion: ["framer-motion"],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
}));
