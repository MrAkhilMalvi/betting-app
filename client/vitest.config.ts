import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],

  // ✅ ADD THIS
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});