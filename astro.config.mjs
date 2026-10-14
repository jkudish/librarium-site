import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://librarium.agentsy.build",
  redirects: {
    "/docs/groups-and-modes": "/docs/source-selection",
    "/docs/php/groups-and-modes": "/docs/php/source-selection",
  },
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/v1") && !["/cli-mcp", "/docs/groups-and-modes", "/docs/php/groups-and-modes"].includes(new URL(page).pathname.replace(/\/$/, "")) })],
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
