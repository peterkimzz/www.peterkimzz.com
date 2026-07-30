<script setup lang="ts">
import { excerptFromRaw } from "~/utils/content";

const { data: articles } = await useAsyncData("home-articles", () => {
  return queryCollection("content")
    .order("created", "DESC")
    .select(
      "path",
      "title",
      "description",
      "created",
      "category",
      "tags",
      "rawbody",
    )
    .all();
});

const cards = computed(() => {
  return (articles.value || []).map((article) => ({
    ...article,
    description: article.description || excerptFromRaw(article.rawbody),
  }));
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    <ul class="grid gap-12 py-2 sm:grid-cols-2 lg:grid-cols-3">
      <ArticleCard
        v-for="article in cards"
        :key="article.path"
        :path="article.path"
        :title="article.title || 'Untitled'"
        :description="article.description"
        :created="article.created"
        :category="article.category"
        :tags="article.tags"
      />
    </ul>
  </div>
</template>
