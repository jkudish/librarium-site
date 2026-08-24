import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://librarium.agentsy.build",
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/v1") })],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      // github-dark-default's palette is designed for a near-black background,
      // so it stays AA-readable on the neutral-950 pre override in global.css.
      theme: "github-dark-default",
    },
  },
});
