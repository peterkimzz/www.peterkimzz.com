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
const tocLinks = computed(() => publishedArticle.body?.toc?.links || []);

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
  <div class="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
    <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
      <main class="mx-auto w-full max-w-3xl min-w-0 xl:max-w-4xl">
        <header class="pb-10 text-center">
          <h1
            class="mx-auto max-w-2xl pb-3 text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl"
          >
            {{ publishedArticle.title }}
          </h1>

          <ArticleDate
            :value="publishedArticle.created"
            class="text-base font-medium text-gray-500 sm:text-lg"
          />
        </header>

        <ContentRenderer
          :value="publishedArticle"
          class="article-prose prose mt-10 max-w-none md:prose-lg prose-headings:tracking-tight prose-p:text-gray-700 prose-p:font-medium prose-strong:font-bold prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:text-gray-600"
        />

        <ArticleComment />
      </main>

      <aside class="hidden lg:block">
        <section
          v-if="tocLinks.length"
          class="sticky top-24 border-l border-gray-200 pl-6"
        >
          <h4
            class="pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400"
          >
            목차
          </h4>
          <ul class="space-y-3">
            <li v-for="link in tocLinks" :key="link.id" class="space-y-2">
              <NuxtLink
                :to="`#${link.id}`"
                class="block text-sm leading-6 font-medium text-gray-700 no-underline transition hover:text-gray-950 hover:underline"
              >
                {{ link.text }}
              </NuxtLink>

              <ul
                v-if="link.children?.length"
                class="space-y-1.5 border-l border-gray-100 pl-3"
              >
                <li v-for="child in link.children" :key="child.id">
                  <NuxtLink
                    :to="`#${child.id}`"
                    class="block text-sm leading-6 text-gray-500 no-underline transition hover:text-gray-800 hover:underline"
                  >
                    {{ child.text }}
                  </NuxtLink>
                </li>
              </ul>
            </li>
          </ul>
        </section>
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
