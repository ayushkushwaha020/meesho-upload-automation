// @lovable.dev/vite-tanstack-config already includes the TanStack Start, React,
// Tailwind, path aliases, and Nitro plugins. Keep the config minimal for Render preview.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    preview: {
      allowedHosts: ["meesshosnap-studio.onrender.com"],
    },
  },
});
