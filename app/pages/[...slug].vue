<script setup lang="ts">
import {
  normalizeContentPath,
  normalizeTag,
  tagPath,
  toAbsoluteUrl,
  toSeoDescription,
} from "~/utils/content";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const articlePath = normalizeContentPath(route.path);

useZoomableImages();

const { data: article } = await useAsyncData(`article:${articlePath}`, () => {
  return queryCollection("content").path(articlePath).first();
});

if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

const currentArticle = article.value;
const tocLinks = computed(() => currentArticle.body?.toc?.links || []);
const articleTags = computed(() =>
  [...new Set((currentArticle.tags || []).map(normalizeTag))].filter(Boolean),
);
const seriesName = currentArticle.series?.name?.trim();

const { data: related } = await useAsyncData(`related:${articlePath}`, () => {
  return queryCollection("content")
    .where("category", "=", currentArticle.category)
    .where("path", "<>", articlePath)
    .order("created", "DESC")
    .select("path", "title", "description", "created", "category")
    .all();
});

const { data: seriesArticles } = await useAsyncData(
  `series:${seriesName || "none"}`,
  async () => {
    if (!seriesName) {
      return [];
    }

    const candidates = await queryCollection("content")
      .select("path", "title", "series")
      .all();

    return candidates.filter(
      (candidate) => candidate.series?.name?.trim() === seriesName,
    );
  },
);

const seoTitle = currentArticle.seo?.title || currentArticle.title;
const seoDescription = toSeoDescription(
  currentArticle.seo?.description || currentArticle.description,
);
const seoImage = currentArticle.seo?.image || currentArticle.image;
const canonicalUrl =
  toAbsoluteUrl(currentArticle.seo?.canonical, runtimeConfig.public.siteUrl) ||
  toAbsoluteUrl(articlePath, runtimeConfig.public.siteUrl) ||
  runtimeConfig.public.siteUrl;
const absoluteSeoImage = toAbsoluteUrl(seoImage, runtimeConfig.public.siteUrl);

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: absoluteSeoImage,
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: absoluteSeoImage,
});

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
    <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
      <main class="mx-auto w-full max-w-3xl min-w-0 xl:max-w-4xl">
        <header class="text-center">
          <h1
            class="mx-auto max-w-2xl pb-3 text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl"
          >
            {{ currentArticle.title }}
          </h1>

          <ArticleDate
            :value="currentArticle.created"
            class="text-base font-medium text-gray-500 sm:text-lg"
          />

          <ul
            v-if="articleTags.length"
            class="mt-4 flex flex-wrap justify-center gap-2"
            aria-label="글 태그"
          >
            <li v-for="tag in articleTags" :key="tag">
              <NuxtLink
                :to="tagPath(tag)"
                class="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600 no-underline hover:bg-gray-200 hover:no-underline"
              >
                #{{ tag }}
              </NuxtLink>
            </li>
          </ul>

          <ArticleSeoPreview
            :title="seoTitle"
            :description="seoDescription"
            :image="absoluteSeoImage"
            :canonical="canonicalUrl"
          />
        </header>

        <ArticleSeries
          v-if="seriesName && seriesArticles?.length"
          :name="seriesName"
          :current-path="articlePath"
          :articles="seriesArticles"
        />

        <ContentRenderer
          :value="currentArticle"
          class="article-prose prose mt-10 max-w-none md:prose-lg prose-headings:tracking-tight prose-p:text-gray-700 prose-p:font-medium prose-strong:font-bold prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:text-gray-600"
        />

        <ArticleComment />
      </main>

      <aside class="hidden lg:block">
        <ArticleToc :links="tocLinks" />
      </aside>
    </div>

    <section class="py-12">
      <h3 class="text-2xl font-bold tracking-[-0.02em] text-gray-950">
        같은 카테고리의 다른 글
      </h3>

      <div class="pt-8">
        <div v-if="!related?.length">다른 글이 없습니다.</div>

        <ul v-else class="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          <ArticleCard
            v-for="item in related"
            :key="item.path"
            :path="item.path"
            :title="item.title"
            :description="item.description"
            :created="item.created"
            :category="item.category"
          />
        </ul>
      </div>
    </section>
  </div>
</template>
