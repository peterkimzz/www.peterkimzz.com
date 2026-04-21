import { defineCollection, defineContentConfig } from "@nuxt/content";
import { z } from "zod";

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: "**/*.md",
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        image: z.string().optional(),
        created: z.string().optional(),
        updated: z.string().optional(),
        published: z.boolean().default(false),
        rawbody: z.string().optional(),
      }),
    }),
  },
});
