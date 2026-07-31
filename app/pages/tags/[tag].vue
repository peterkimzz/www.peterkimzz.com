<script setup lang="ts">
import { normalizeTag } from "~/utils/content";

const route = useRoute();
const rawTag = Array.isArray(route.params.tag)
  ? route.params.tag[0]
  : route.params.tag;
const tag = normalizeTag(rawTag);

const { data: allArticles } = await useAsyncData(`tag:${tag}`, () =>
  queryCollection("content")
    .order("created", "DESC")
    .select("path", "title", "description", "created", "category", "tags")
    .all(),
);

const articles = computed(() =>
  (allArticles.value || []).filter((article) =>
    article.tags?.some((articleTag) => normalizeTag(articleTag) === tag),
  ),
);

if (!tag || !articles.value.length) {
  throw createError({
    statusCode: 404,
    statusMessage: "Tag not found",
    fatal: true,
  });
}

useSeoMeta({
  title: `#${tag} 글`,
  description: `${tag} 태그로 분류된 peterkimzz 블로그 글입니다.`,
  ogTitle: `#${tag} 글`,
  ogDescription: `${tag} 태그로 분류된 peterkimzz 블로그 글입니다.`,
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
    <header class="mb-10 border-b border-gray-200 pb-8">
      <p class="text-sm font-semibold text-blue-600">태그</p>
      <h1
        class="mt-1 text-3xl font-bold tracking-[-0.03em] text-gray-950 sm:text-4xl"
      >
        #{{ tag }}
      </h1>
      <p class="mt-3 font-medium text-gray-500">{{ articles.length }}개의 글</p>
    </header>

    <ul class="grid gap-12 py-2 sm:grid-cols-2 lg:grid-cols-3">
      <ArticleCard
        v-for="article in articles"
        :key="article.path"
        :path="article.path"
        :title="article.title"
        :description="article.description"
        :created="article.created"
        :category="article.category"
        :tags="article.tags"
      />
    </ul>
  </div>
</template>
