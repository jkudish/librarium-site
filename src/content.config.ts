import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const docs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

const v1Docs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/v1-docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

const phpDocs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/php-docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: z.object({ title: z.string(), description: z.string(), order: z.number() }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    kind: z.enum(["product", "comparison", "story"]),
    runtime: z.enum(["javascript", "laravel", "cli"]).optional(),
    redirect: z.string().optional(),
    ctaHref: z.string(),
    ctaLabel: z.string(),
  }),
});

export const collections = { docs, v1Docs, phpDocs, guides, pages };
