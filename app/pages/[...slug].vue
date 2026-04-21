<script setup lang="ts">
import { excerptFromRaw, normalizeContentPath } from "~/utils/content";

const route = useRoute();
const articlePath = normalizeContentPath(route.path);

useZoomableImages();

const { data: article } = await useAsyncData(`article:${articlePath}`, () => {
  return queryCollection("content").path(articlePath).first();
});

if (!article.value || !article.value.published) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

const publishedArticle = article.value;

const { data: related } = await useAsyncData(`related:${articlePath}`, () => {
  return queryCollection("content")
    .where("published", "=", true)
    .where("category", "=", publishedArticle.category || "")
    .where("path", "<>", articlePath)
    .order("created", "DESC")
    .select("path", "title", "description", "created", "category", "rawbody")
    .all();
});

useSeoMeta({
  title: publishedArticle.title,
  description:
    publishedArticle.description || excerptFromRaw(publishedArticle.rawbody),
  ogTitle: publishedArticle.title,
  ogDescription:
    publishedArticle.description || excerptFromRaw(publishedArticle.rawbody),
  ogImage: publishedArticle.image,
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    <div
      class="flex h-full flex-col gap-10 transition-all lg:flex-row lg:gap-10"
    >
      <main
        class="mx-auto w-full max-w-prose lg:flex-1 lg:overflow-y-scroll lg:pr-4"
      >
        <header class="pb-10 text-center">
          <h1
            class="mx-auto max-w-md pb-3 text-3xl font-bold leading-tight tracking-[-0.01em] text-black"
          >
            {{ publishedArticle.title }}
          </h1>

          <ArticleDate :value="publishedArticle.created" class="text-lg" />
        </header>

        <ContentRenderer
          :value="publishedArticle"
          class="article-prose prose md:prose-lg max-w-full prose-headings:tracking-tight prose-p:text-gray-600 prose-p:font-medium prose-a:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:font-bold prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:text-gray-600"
        />

        <ArticleComment />
      </main>

      <aside
        class="sticky top-[53px] mx-auto h-fit w-full max-w-prose py-2 lg:py-0"
      >
        <section
          v-if="publishedArticle.body?.toc?.links?.length"
          class="hidden lg:block"
        >
          <h4 class="pb-0.5 text-sm font-semibold text-gray-600">목차</h4>
          <ul class="space-y-1">
            <li
              v-for="link in publishedArticle.body.toc.links"
              :key="link.id"
              class="font-medium text-gray-900"
            >
              <NuxtLink
                :to="`#${link.id}`"
                class="text-inherit no-underline hover:underline"
              >
                {{ link.text }}
              </NuxtLink>
            </li>
          </ul>
        </section>
      </aside>
    </div>

    <section class="py-10">
      <h3 class="text-2xl font-bold text-black">같은 카테고리의 다른 글</h3>

      <div class="py-10">
        <div v-if="!related?.length">다른 글이 없습니다.</div>

        <ul v-else class="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <ArticleCard
            v-for="item in related"
            :key="item.path"
            :path="item.path"
            :title="item.title || 'Untitled'"
            :description="item.description || excerptFromRaw(item.rawbody, 68)"
            :created="item.created"
            :category="item.category"
          />
        </ul>
      </div>
    </section>
  </div>
</template>
