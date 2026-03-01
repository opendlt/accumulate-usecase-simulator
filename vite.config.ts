import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split each industry's scenarios into its own named chunk
          if (id.includes("/scenarios/defense/")) return "scenarios-defense";
          if (id.includes("/scenarios/finance/")) return "scenarios-finance";
          if (id.includes("/scenarios/healthcare/")) return "scenarios-healthcare";
          if (id.includes("/scenarios/saas/")) return "scenarios-saas";
          if (id.includes("/scenarios/supply-chain/")) return "scenarios-supply-chain";
          if (id.includes("/scenarios/web3/")) return "scenarios-web3";
        },
      },
    },
  },
});
