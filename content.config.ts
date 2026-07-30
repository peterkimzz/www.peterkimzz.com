import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: "**/*.md",
      schema: z.object({
        title: z.string().optional().editor({ label: "제목" }),
        description: z
          .string()
          .optional()
          .editor({ label: "설명", input: "textarea" }),
        category: z.string().optional().editor({ label: "카테고리" }),
        image: z
          .string()
          .optional()
          .editor({ label: "커버 이미지", input: "media" }),
        created: z.string().optional().editor({ label: "작성일" }),
        updated: z.string().optional().editor({ label: "수정일" }),
        tags: z.array(z.string()).default([]).editor({
          label: "태그",
          description: "검색과 글 분류에 사용합니다.",
        }),
        series: z
          .object({
            name: z.string().editor({ label: "시리즈 이름" }),
            order: z.number().editor({ label: "시리즈 순서" }),
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
        rawbody: z.string().optional().editor({ hidden: true }),
      }),
    }),
  },
});
