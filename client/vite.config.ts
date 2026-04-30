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
        target: "http://192.168.0.58:3000", // your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
