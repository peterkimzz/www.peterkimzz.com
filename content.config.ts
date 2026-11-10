import { defineCollection, defineContentConfig, z } from "@nuxt/content";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);

    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "올바른 YYYY-MM-DD 날짜를 입력해 주세요.");

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      // content/drafts/ 는 dev 에서만 보이고 프로덕션 빌드에서는 빠진다.
      source: {
        include: "**/*.md",
        exclude: process.env.NODE_ENV === "production" ? ["drafts/**"] : [],
      },
      schema: z.object({
        title: z.string().trim().min(1),
        description: z.string().optional(),
        category: z.enum(["tech", "retrospective", "design", "life", "nuxt3"]),
        image: z.string().optional(),
        created: isoDate,
        updated: isoDate,
        tags: z.array(z.string()).default([]),
        series: z
          .object({
            name: z.string(),
            order: z.number().int().positive(),
          })
          .optional(),
        seo: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            image: z.string().optional(),
            canonical: z.string().optional(),
          })
          .optional(),
      }),
    }),
  },
});
