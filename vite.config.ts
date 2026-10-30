// @lovable.dev/vite-tanstack-config provides TanStack Start, React, Tailwind and path aliases.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    preview: {
      allowedHosts: ["meesshosnap-studio.onrender.com"],
    },
  },
  nitro: {
    preset: "node-server",
  },
});
