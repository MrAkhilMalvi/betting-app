import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      overlay: false,
    },

    // 🔥 PROXY CONFIG (IMPORTANT)
    proxy: {
      "/api": {
        target: "http://localhost:3000", // your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
