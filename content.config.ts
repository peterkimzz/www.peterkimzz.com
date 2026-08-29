import { defineCollection, defineContentConfig, z } from "@nuxt/content";

const isoDate = (label: string) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const date = new Date(`${value}T00:00:00Z`);

      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }, "올바른 YYYY-MM-DD 날짜를 입력해 주세요.")
    .editor({
      label,
      description: "YYYY-MM-DD 형식으로 입력해 주세요.",
    });

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: "**/*.md",
      schema: z.object({
        title: z.string().trim().min(1).editor({ label: "제목" }),
        description: z
          .string()
          .optional()
          .editor({ label: "설명", input: "textarea" }),
        category: z
          .enum(["tech", "retrospective", "design", "life", "nuxt3"])
          .editor({ label: "카테고리" }),
        image: z
          .string()
          .optional()
          .editor({ label: "커버 이미지", input: "media" }),
        created: isoDate("작성일"),
        updated: isoDate("수정일"),
        tags: z.array(z.string()).default([]).editor({
          label: "태그",
          description: "검색과 글 분류에 사용합니다.",
        }),
        series: z
          .object({
            name: z.string().editor({ label: "시리즈 이름" }),
            order: z.number().int().positive().editor({ label: "시리즈 순서" }),
          })
          .optional()
          .editor({
            label: "시리즈",
            description: "같은 이름의 글을 순서대로 연결합니다.",
          }),
        seo: z
          .object({
            title: z.string().optional().editor({ label: "검색 제목" }),
            description: z
              .string()
              .optional()
              .editor({ label: "검색 설명", input: "textarea" }),
            image: z
              .string()
              .optional()
              .editor({ label: "공유 이미지", input: "media" }),
            canonical: z.string().optional().editor({ label: "Canonical URL" }),
          })
          .optional()
          .editor({
            label: "SEO",
            description: "비워두면 글의 기본 정보를 사용합니다.",
          }),
      }),
    }),
  },
});
